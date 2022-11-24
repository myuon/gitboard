import { Context, ParameterizedContext } from "koa";
import { ContextState } from "../..";
import { Commit } from "../../../shared/model/commit";
import { getPullRequests } from "../api/pullRequest";
import { getRepositories } from "../api/repository";
import dayjs from "dayjs";
import { PullRequest } from "../../../shared/model/pullRequest";
import { minBy } from "../helper/array";
import { collectAllSettledresult } from "../helper/promise";
import { ulid } from "ulid";
import { Repository } from "../../../shared/model/repository";
import { sleep } from "../../../shared/helper/sleep";

export const handlerImportRepository = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const userId = "224NHwAGI5QjUi0fJj5CUwujO0L2";

  const relations = await ctx.state.app.userOwnerRelationTable.findByUserId({
    userId,
  });
  await Promise.all(
    relations.map(async (relation) => {
      const repos = await getRepositories(
        process.env.GITHUB_TOKEN,
        relation.owner
      );
      repos.organization?.repositories.nodes?.map(async (repo) => {
        if (!repo) {
          return;
        }

        await ctx.state.app.repositoryTable.save({
          id: repo.id,
          name: repo.name,
          owner: relation.owner,
          defaultBranchName: repo.defaultBranchRef?.name,
        });
      });
    })
  );

  ctx.status = 204;

  return null;
};

const importPullRequest = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>,
  repository: Repository
) => {
  if (!repository.defaultBranchName) {
    ctx.throw(404, "Repository defaultBranch not found");
  }

  const prs = await getPullRequests(
    process.env.GITHUB_TOKEN,
    repository.owner,
    repository.name,
    repository.defaultBranchName,
    null
  );

  await Promise.all(
    prs.repository?.pullRequests.nodes?.map(async (pullRequest) => {
      if (!pullRequest || !pullRequest.author) {
        return;
      }

      const prModel: PullRequest = {
        id: pullRequest.id,
        owner: repository.owner,
        repositoryId: repository.id,
        number: pullRequest.number,
        title: pullRequest.title,
        state: pullRequest.state,
        url: pullRequest.url,
        createdBy: pullRequest.author.login,
        closedAt: pullRequest.closedAt,
        createdAt: pullRequest.createdAt,
        updatedAt: pullRequest.updatedAt,
        leadTimeSec: undefined,
      };
      await ctx.state.app.pullRequestTable.save(prModel);

      const commits: Commit[] = [];
      const result = await Promise.allSettled(
        pullRequest.commits.nodes?.map(async (node) => {
          if (!node || !node.commit.author) {
            return;
          }

          const commit = {
            id: node.commit.id,
            owner: repository.owner,
            oid: node.commit.oid,
            message: node.commit.message,
            url: node.commit.url,
            committedDate: node.commit.committedDate,
            createdBy: node.commit.author.name ?? "",
          };
          await ctx.state.app.commitTable.save(commit);

          await ctx.state.app.commitPullRequestRelationTable.save({
            commitId: node.commit.id,
            pullRequestId: pullRequest.id,
          });

          commits.push(commit);
        }) ?? []
      );
      const { errors } = collectAllSettledresult(result);
      if (errors.length > 0) {
        ctx.log.error(errors);
      }

      if (prModel.closedAt) {
        const earliestCommit = minBy(commits, (commit) =>
          dayjs(commit.committedDate).unix()
        );

        prModel.leadTimeSec =
          dayjs(prModel.closedAt).unix() -
          dayjs(earliestCommit.committedDate).unix();

        await ctx.state.app.pullRequestTable.save(prModel);
      }
    }) ?? []
  );
};

export const handlerImportPullRequest = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const repository = await ctx.state.app.repositoryTable.findOneBy({
    id: ctx.params.id,
  });
  if (!repository) {
    ctx.throw(404, "Repository not found");
  }

  await importPullRequest(ctx, repository);

  ctx.status = 204;
};

const userId = "224NHwAGI5QjUi0fJj5CUwujO0L2";

export const handlerImportScheduled = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const relations = await ctx.state.app.userOwnerRelationTable.findByUserId({
    userId,
  });
  if (relations.length === 0) {
    ctx.throw(404, "UserOwnerRelation not found");
  }

  const target = relations[0];
  const owner = target.owner;

  const latest = await ctx.state.app.scheduleTable.findLatest(owner);
  if (
    latest !== undefined &&
    dayjs().diff(dayjs.unix(latest.createdAt), "minute") <= 30
  ) {
    ctx.throw(429, "Too many requests");
  }

  const scheduleId = ulid();

  const repositories = await ctx.state.app.repositoryTable.findBy({
    owner: [owner],
  });

  const promises = repositories.map((repository) => async () => {
    ctx.log.info(`start import ${repository.name}`);
    return importPullRequest(ctx, repository);
  });

  const result = [];
  while (promises.length > 0) {
    result.push(
      ...(await Promise.allSettled(promises.splice(0, 3).map((p) => p())))
    );

    await sleep(1500);
  }

  const { errors } = collectAllSettledresult(result);
  if (errors.length > 0) {
    ctx.log.error(errors);
  }

  await ctx.state.app.scheduleTable.create({
    id: scheduleId,
    owner: target.owner,
    title: "sync",
    createdAt: dayjs().unix(),
  });

  return "ok";
};
