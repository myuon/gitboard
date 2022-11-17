import "reflect-metadata";
import Koa from "koa";
import logger from "koa-pino-logger";
import * as path from "path";
import { authJwt } from "./src/middleware/authJwt";
import { serveStaticProd } from "./src/middleware/serve";
import { newRouter } from "./src/router";
import * as admin from "firebase-admin";
import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "db.sqlite"),
  entities: [],
  logging: true,
  synchronize: true,
});

const app = new Koa();

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
