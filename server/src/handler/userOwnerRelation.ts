import { Context, ParameterizedContext } from "koa";
import { ContextState } from "../..";
import {
  SaveUserOwnerRelationInput,
  DeleteUserOwnerRelationInput,
} from "../../../shared/request/userOwnerRelation";
import dayjs from "dayjs";

const userId = "224NHwAGI5QjUi0fJj5CUwujO0L2";

export const handlerAdminSaveUserOwnerRelation = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>,
  input: SaveUserOwnerRelationInput
) => {
  if (ctx.state.auth.uid !== userId) {
    ctx.throw(401, "unauthorized");
  }

  await ctx.state.app.userOwnerRelationTable.save({
    userId: input.userId,
    owner: input.owner,
    createdAt: dayjs().unix(),
  });

  ctx.status = 204;

  return null;
};

export const handlerAdminDeleteUserOwnerRelation = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>,
  input: DeleteUserOwnerRelationInput
) => {
  if (ctx.state.auth.uid !== userId) {
    ctx.throw(401, "unauthorized");
  }

  await ctx.state.app.userOwnerRelationTable.delete({
    userId,
    owner: input.owner,
    createdAt: dayjs().unix(),
  });

  ctx.status = 204;

  return null;
};

export const handlerGetUserOwnerRelation = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  return await ctx.state.app.userOwnerRelationTable.findAll();
};
