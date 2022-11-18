import "reflect-metadata";
import Koa, { Context } from "koa";
import logger from "koa-pino-logger";
import * as path from "path";
import { authJwt, requireAuth } from "./src/middleware/authJwt";
import { serveStaticProd } from "./src/middleware/serve";
import { newRouter } from "./src/router";
import * as admin from "firebase-admin";
import { DataSource } from "typeorm";
import {
  newUserGitHubTokenRepository,
  UserGitHubTokenTable,
} from "./src/db/userGitHubToken";
import {
  newUserOwnerRelationRepository,
  UserOwnerRelationTable,
} from "./src/db/userOwnerRelationTable";
import { newRepositoryRepository, RepositoryTable } from "./src/db/repository";
import {
  newPullRequestRepository,
  PullRequestTable,
} from "./src/db/pullRequest";
import { CommitTable, newCommitRepository } from "./src/db/commit";
import {
  CommitPullRequestRelationTable,
  newCommitPullRequestRelationRepository,
} from "./src/db/commitPullRequestRelation";

const dataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "db.sqlite"),
  entities: [
    UserGitHubTokenTable,
    UserOwnerRelationTable,
    RepositoryTable,
    PullRequestTable,
    CommitTable,
    CommitPullRequestRelationTable,
  ],
  logging: true,
  synchronize: true,
});
const userGitHubTokenTable = newUserGitHubTokenRepository(
  dataSource.getRepository(UserGitHubTokenTable)
);
const userOwnerRelationTable = newUserOwnerRelationRepository(
  dataSource.getRepository(UserOwnerRelationTable)
);
const repositoryTable = newRepositoryRepository(
  dataSource.getRepository(RepositoryTable)
);
const pullRequestTable = newPullRequestRepository(
  dataSource.getRepository(PullRequestTable)
);
const commitTable = newCommitRepository(dataSource.getRepository(CommitTable));
const commitPullRequestRelationTable = newCommitPullRequestRelationRepository(
  dataSource.getRepository(CommitPullRequestRelationTable)
);

export interface ContextState {
  auth: admin.auth.DecodedIdToken;
  app: {
    userGitHubTokenTable: typeof userGitHubTokenTable;
    userOwnerRelationTable: typeof userOwnerRelationTable;
    repositoryTable: typeof repositoryTable;
    pullRequestTable: typeof pullRequestTable;
    commitTable: typeof commitTable;
    commitPullRequestRelationTable: typeof commitPullRequestRelationTable;
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
    repositoryTable,
    pullRequestTable,
    commitTable,
    commitPullRequestRelationTable,
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
