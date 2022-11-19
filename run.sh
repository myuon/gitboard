#!/bin/sh
set -e

# cf: https://qiita.com/faable01/items/ac7418d671c6db5b966f

# コンテナ起動時に持っているSQLiteのデータベースファイルは、
# 後続処理でリストアに成功したら削除したいので、リネームしておく
if [ -f ./dist/server/db.sqlite ]; then
  mv ./dist/server/db.sqlite ./dist/server/db.sqlite.bk
fi

# Cloud Storage からリストア
litestream restore -if-replica-exists -config /etc/litestream.yml ./dist/server/db.sqlite

if [ -f ./dist/server/db.sqlite ]; then
  # リストアに成功したら、リネームしていたファイルを削除
  echo "---- Restored from Cloud Storage ----"
  rm ./dist/server/db.sqlite.bk
else
  # 初回起動時にはレプリカが未作成であり、リストアに失敗するので、
  # その場合には、冒頭でリネームしたdbファイルを元の名前に戻す
  echo "---- Failed to restore from Cloud Storage ----"
  mv ./dist/server/db.sqlite.bk ././dist/server/db.sqlite
fi

# メインプロセスに、litestreamによるレプリケーション、
# サブプロセスに Next.js アプリケーションを走らせる
exec litestream replicate -exec "/nodejs/bin/node dist/server/index.js" -config /etc/litestream.yml
