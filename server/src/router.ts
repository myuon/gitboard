import koaBody from "koa-body";
import Router, { IRouterOptions } from "koa-router";
import { z } from "zod";
import { ContextState } from "..";
import { schemaForType } from "./helper/zod";
import { requireAuth } from "./middleware/authJwt";
import { SearchPullRequestInput } from "../../shared/request/pullRequest";
import { SearchRepositoryInput } from "../../shared/request/repository";
import {
  handlerImportPullRequest,
  handlerImportRepository,
} from "./handler/import";
import {
  handlerAdminDeleteUserOwnerRelation,
  handlerAdminSaveUserOwnerRelation,
} from "./handler/userOwnerRelation";
import {
  DeleteUserOwnerRelationInput,
  SaveUserOwnerRelationInput,
} from "../../shared/request/userOwnerRelation";

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
    const ownerRelations =
      await ctx.state.app.userOwnerRelationTable.findByUserId({
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
  router.post("/repository/search", koaBody(), async (ctx) => {
    const schema = schemaForType<SearchRepositoryInput>()(
      z.object({
        ids: z.array(z.string()),
      })
    );
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.throw(400, result.error);
      return;
    }

    const ownerRelations =
      await ctx.state.app.userOwnerRelationTable.findByUserId({
        userId: ctx.state.auth.uid,
      });
    if (ownerRelations.length === 0) {
      ctx.throw(401, "unauthorized");
      return;
    }

    ctx.body = await ctx.state.app.repositoryTable.findBy({
      owner: ownerRelations.map((r) => r.owner),
      ids: result.data.ids,
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

    const ownerRelations =
      await ctx.state.app.userOwnerRelationTable.findByUserId({
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
    ctx.body = handlerImportRepository(ctx);
  });
  router.post("/import/pullRequest/:id", async (ctx) => {
    ctx.body = handlerImportPullRequest(ctx);
  });

  router.post("/admin/userOwnerRelation", koaBody(), async (ctx) => {
    const schema = schemaForType<SaveUserOwnerRelationInput>()(
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

    ctx.body = handlerAdminSaveUserOwnerRelation(ctx, result.data);
  });
  router.delete("/admin/userOwnerRelation", koaBody(), async (ctx) => {
    const schema = schemaForType<DeleteUserOwnerRelationInput>()(
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

    ctx.body = handlerAdminDeleteUserOwnerRelation(ctx, result.data);
  });
  router.get("/admin/userOwnerRelation", async (ctx) => {
    ctx.body = await ctx.state.app.userOwnerRelationTable.findAll();
  });

  return router;
};
