import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../type/declarations/user.type";
import type { DrizzleError } from "drizzle-orm";

export interface UserJwtPayload extends JwtPayload {
  user: User;
}

export const errorHandler = (error: unknown) => {
  const err = error as DrizzleError;
  let mysqlErr: { sqlMessage: string; code?: string } | undefined;

  if (err.cause && typeof err.cause === "object" && "sqlMessage" in err.cause) {
    mysqlErr = err.cause as { sqlMessage: string; code?: string };
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: mysqlErr?.sqlMessage ?? "Failed to add staff member",
    cause: mysqlErr?.code,
  });
};

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  const token = ctx.cookies.get("accessToken")?.value;
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No token supplied" });
  }

  let payload: UserJwtPayload;
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as UserJwtPayload;
  } catch (err) {
    console.log(err);

    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return next({
    ctx: {
      ...ctx,
      session: { userId: payload.userId, email: payload.email },
      user: payload.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
