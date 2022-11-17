import "reflect-metadata";
import Koa, { Context } from "koa";
import logger from "koa-pino-logger";
import * as path from "path";
import { authJwt, requireAuth } from "./src/middleware/authJwt";
import { serveStaticProd } from "./src/middleware/serve";
import { newRouter } from "./src/router";
import * as admin from "firebase-admin";
import { DataSource } from "typeorm";
import { UserGitHubTokenTable } from "./src/db/userGitHubToken";
import { UserOwnerRelationTable } from "./src/db/userOwnerRelationTable";

const dataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "db.sqlite"),
  entities: [UserGitHubTokenTable, UserOwnerRelationTable],
  logging: true,
  synchronize: true,
});
const userGitHubTokenTable = dataSource.getRepository(UserGitHubTokenTable);
const userOwnerRelationTable = dataSource.getRepository(UserOwnerRelationTable);

export interface ContextState {
  auth: admin.auth.DecodedIdToken;
  app: {
    userGitHubTokenTable: typeof userGitHubTokenTable;
    userOwnerRelationTable: typeof userOwnerRelationTable;
  };
}

const app = new Koa<ContextState, Context>();

admin.initializeApp({});
const auth = admin.auth();

app.use(logger());

app.use(
  serveStaticProd({
    path: path.resolve(__dirname, "..", "web"),
    excludePrefix: "/api",
  })
);

app.use(authJwt(auth));
app.use(requireAuth());
app.use(async (ctx, next) => {
  ctx.state.app = {
    userGitHubTokenTable,
    userOwnerRelationTable,
  };

  await next();
});

const router = newRouter({
  prefix: "/api",
});
app.use(router.routes());
app.use(router.allowedMethods());

const start = async () => {
  await dataSource.initialize();

  app.listen(3000);
  console.log(`✨ Server running on http://localhost:3000`);
};

start();
