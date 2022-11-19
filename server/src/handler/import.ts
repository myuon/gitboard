import { Context, ParameterizedContext } from "koa";
import { ContextState } from "../..";
import { getPullRequests } from "../api/pullRequest";
import { getRepositories } from "../api/repository";

export const handlerImportRepository = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const userId = "224NHwAGI5QjUi0fJj5CUwujO0L2";

  const relations = await ctx.state.app.userOwnerRelationTable.findBy({
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

export const handlerImportPullRequest = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const repository = await ctx.state.app.repositoryTable.findOneBy({
    id: ctx.params.id,
  });
  if (!repository) {
    ctx.throw(404, "Repository not found");
    return;
  }
  if (!repository.defaultBranchName) {
    ctx.throw(404, "Repository defaultBranch not found");
    return;
  }

  const prs = await getPullRequests(
    process.env.GITHUB_TOKEN,
    repository.owner,
    repository.name,
    repository.defaultBranchName,
    null
  );
  const endCursor = prs.repository?.pullRequests.pageInfo.endCursor;

  await Promise.all(
    prs.repository?.pullRequests.nodes?.map(async (pullRequest) => {
      if (!pullRequest || !pullRequest.author) {
        return;
      }

      await ctx.state.app.pullRequestTable.save({
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
      });

      await Promise.all(
        pullRequest.commits.nodes?.map(async (node) => {
          if (!node || !node.commit.author) {
            return;
          }

          await ctx.state.app.commitTable.save({
            id: node.commit.id,
            owner: repository.owner,
            oid: node.commit.oid,
            message: node.commit.message,
            url: node.commit.url,
            committedDate: node.commit.committedDate,
            createdBy: node.commit.author.name ?? "",
          });

          await ctx.state.app.commitPullRequestRelationTable.save({
            commitId: node.commit.id,
            pullRequestId: pullRequest.id,
          });
        }) ?? []
      );
    }) ?? []
  );

  ctx.status = 204;
};
