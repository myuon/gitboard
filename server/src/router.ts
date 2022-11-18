import koaBody from "koa-body";
import Router, { IRouterOptions } from "koa-router";
import { z } from "zod";
import { ContextState } from "..";
import { getPullRequests } from "./api/pullRequest";
import { getRepositories } from "./api/repository";
import { schemaForType } from "./helper/zod";
import { requireAuth } from "./middleware/authJwt";
import { SearchPullRequestInput } from "../../shared/request/pullRequest";

export const newRouter = (options?: IRouterOptions) => {
  const router = new Router<ContextState>(options);

  router.get("/hello", async (ctx) => {
    ctx.body = "Hello World!";
  });
  router.post("/echo", requireAuth(), koaBody(), async (ctx) => {
    interface EchoInput {
      message: string;
    }

    const schema = schemaForType<EchoInput>()(
      z.object({
        message: z.string(),
      })
    );
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.throw(400, result.error);
      return;
    }

    ctx.body = result.data.message;
  });

  router.put("/user/token", koaBody(), async (ctx) => {
    interface Input {
      token: string;
    }
    const schema = schemaForType<Input>()(
      z.object({
        token: z.string(),
      })
    );
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.throw(400, result.error);
      return;
    }

    await ctx.state.app.userGitHubTokenTable.save({
      userId: ctx.state.auth.uid,
      token: result.data.token,
      updatedAt: Date.now(),
    });

    ctx.status = 204;
  });
  router.post("/userOwnerRelation", koaBody(), async (ctx) => {
    interface Input {
      userId: string;
      owner: string;
    }
    const schema = schemaForType<Input>()(
      z.object({
        userId: z.string(),
        owner: z.string(),
      })
    );
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.throw(400, result.error);
      return;
    }
  });

  router.get("/repository", async (ctx) => {
    const ownerRelations = await ctx.state.app.userOwnerRelationTable.findBy({
      userId: ctx.state.auth.uid,
    });
    if (ownerRelations.length === 0) {
      ctx.throw(401, "unauthorized");
      return;
    }

    ctx.body = await ctx.state.app.repositoryTable.findBy({
      owner: ownerRelations.map((r) => r.owner),
    });
  });

  router.post("/pullRequest/search", koaBody(), async (ctx) => {
    const schema = schemaForType<SearchPullRequestInput>()(
      z.object({
        createdBy: z.string().optional(),
        createdAtSpan: z.object({
          start: z.string(),
          end: z.string(),
        }),
      })
    );
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.throw(400, result.error);
      return;
    }

    const ownerRelations = await ctx.state.app.userOwnerRelationTable.findBy({
      userId: ctx.state.auth.uid,
    });
    if (ownerRelations.length === 0) {
      ctx.throw(401, "unauthorized");
      return;
    }

    const pullRequests = await ctx.state.app.pullRequestTable.findBy({
      owner: ownerRelations.map((r) => r.owner),
      createdBy: result.data.createdBy,
      createdAt: {
        start: result.data.createdAtSpan.start,
        end: result.data.createdAtSpan.end,
      },
    });

    ctx.body = pullRequests;
  });

  router.post("/import/repository", async (ctx) => {
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
  });
  router.post("/import/pullRequest/:id", async (ctx) => {
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
  });

  return router;
};
