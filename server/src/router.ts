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
  handlerImportScheduled,
} from "./handler/import";
import {
  handlerAdminDeleteUserOwnerRelation,
  handlerGetUserOwnerRelation,
  handlerAdminSaveUserOwnerRelation,
} from "./handler/userOwnerRelation";
import {
  DeleteUserOwnerRelationInput,
  SaveUserOwnerRelationInput,
} from "../../shared/request/userOwnerRelation";
import { handlerGetLastSchedule } from "./handler/schedule";

export const newRouter = (options?: IRouterOptions) => {
  const router = new Router<ContextState>(options);

  // = No auth section

  router.post("/import/scheduled", async (ctx) => {
    ctx.body = await handlerImportScheduled(ctx);
  });

  // = Require auth section
  router.use(requireAuth());

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

  router.get("/schedule/last", async (ctx) => {
    ctx.body = await handlerGetLastSchedule(ctx);
  });

  router.post("/import/repository", async (ctx) => {
    ctx.body = await handlerImportRepository(ctx);
  });
  router.post("/import/pullRequest/:id", async (ctx) => {
    ctx.body = await handlerImportPullRequest(ctx);
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

    ctx.body = await handlerAdminSaveUserOwnerRelation(ctx, result.data);
  });
  router.post("/admin/userOwnerRelation/delete", koaBody(), async (ctx) => {
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

    ctx.body = await handlerAdminDeleteUserOwnerRelation(ctx, result.data);
  });
  router.get("/userOwnerRelation", async (ctx) => {
    ctx.body = await handlerGetUserOwnerRelation(ctx);
  });

  return router;
};
