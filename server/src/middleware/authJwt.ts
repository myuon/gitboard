import { Auth } from "firebase-admin/lib/auth/auth";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { Context, Middleware } from "koa";

export const authJwt =
  (auth: Auth): Middleware =>
  async (ctx, next) => {
    const token = ctx.request.header.authorization?.split("Bearer ")?.[1];

    if (token) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        ctx.state.auth = decodedToken;
      } catch (error) {
        console.error(error);
        ctx.throw("Unauthorized", 401);
      }
    }

    await next();
  };

export const requireAuth =
  (): Middleware<{ auth: DecodedIdToken }, Context> => async (ctx, next) => {
    if (!ctx.state.auth) {
      ctx.throw(401, "Unauthorized");
    }

    await next();
  };
