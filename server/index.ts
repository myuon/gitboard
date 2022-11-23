import "reflect-metadata";
import Koa, { Context } from "koa";
import logger from "koa-pino-logger";
import * as path from "path";
import { authJwt } from "./src/middleware/authJwt";
import { serveStaticProd } from "./src/middleware/serve";
import { newRouter } from "./src/router";
import * as admin from "firebase-admin";
import { DataSource } from "typeorm";
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
import { newScheduleRepository, ScheduleTable } from "./src/db/schedule";

const dataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "db.sqlite"),
  entities: [
    UserOwnerRelationTable,
    RepositoryTable,
    PullRequestTable,
    CommitTable,
    CommitPullRequestRelationTable,
    ScheduleTable,
  ],
  logging: true,
  synchronize: true,
});
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
const scheduleTable = newScheduleRepository(
  dataSource.getRepository(ScheduleTable)
);

export interface ContextState {
  auth: admin.auth.DecodedIdToken;
  app: {
    userOwnerRelationTable: typeof userOwnerRelationTable;
    repositoryTable: typeof repositoryTable;
    pullRequestTable: typeof pullRequestTable;
    commitTable: typeof commitTable;
    commitPullRequestRelationTable: typeof commitPullRequestRelationTable;
    scheduleTable: typeof scheduleTable;
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
app.use(async (ctx, next) => {
  ctx.state.app = {
    userOwnerRelationTable,
    repositoryTable,
    pullRequestTable,
    commitTable,
    commitPullRequestRelationTable,
    scheduleTable,
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

void start();
