import { Context, ParameterizedContext } from "koa";
import { ContextState } from "../..";

export const handlerGetLastSchedule = async (
  ctx: ParameterizedContext<ContextState, Context, unknown>
) => {
  const relations = await ctx.state.app.userOwnerRelationTable.findByUserId({
    userId: ctx.state.auth.uid,
  });
  if (relations.length === 0) {
    ctx.throw(404, "UserOwnerRelation not found");
  }

  const target = relations[0];

  const schedule = await ctx.state.app.scheduleTable.findLatest(target.owner);
  return schedule;
};
