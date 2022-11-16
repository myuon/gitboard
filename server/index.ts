import Koa from "koa";
import logger from "koa-pino-logger";
import * as path from "path";
import { authJwt } from "./src/middleware/authJwt";
import { serveStaticProd } from "./src/middleware/serve";
import { newRouter } from "./src/router";
import * as admin from "firebase-admin";

const app = new Koa();
admin.initializeApp({
  credential: admin.credential.cert(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../.secrets/serviceaccountkey.json")
  ),
});
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

app.listen(3000);
console.log(`✨ Server running on http://localhost:3000`);
