import koaBody from "koa-body";
import Router, { IRouterOptions } from "koa-router";
import { z } from "zod";
import { ContextState } from "..";
import { getRepositories } from "./api/repository";
import { RepositoryTable } from "./db/repository";
import { UserGitHubTokenTable } from "./db/userGitHubToken";
import { schemaForType } from "./helper/zod";
import { requireAuth } from "./middleware/authJwt";

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

    await ctx.state.app.userGitHubTokenTable.save(
      UserGitHubTokenTable.fromModel({
        userId: ctx.state.auth.uid,
        token: result.data.token,
        updatedAt: Date.now(),
      })
    );

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

  router.post("/import/repository", async (ctx) => {
    const userId = "224NHwAGI5QjUi0fJj5CUwujO0L2";

    const relations = (
      await ctx.state.app.userOwnerRelationTable.find({
        where: {
          userId,
        },
      })
    ).map((t) => t.toModel());
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

          await ctx.state.app.repositoryTable.save(
            RepositoryTable.fromModel({
              id: repo.id,
              name: repo.name,
              owner: relation.owner,
            })
          );
        });
      })
    );

    ctx.status = 204;
  });

  return router;
};
