import {
  router,
  publicProcedure,
  protectedProcedure,
  UserJwtPayload,
} from "../../trpc";
import { z } from "zod";
import { db } from "../../db/db";
import { user } from "../../db/schema/userSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/server/db/schema"; // adapte ton chemin

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export const authRouter = router({
  testDB: publicProcedure.query(async () => {
    if (!process.env.DATABASE_URL) {
      return { success: false, error: "DATABASE_URL not set" };
    }

    try {
      await db.execute("SELECT 1"); // simple test

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1)
        .execute();

      if (result.length === 0)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const foundUser = result[0];
      const valid = await bcrypt.compare(input.password, foundUser.password);

      if (!valid)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });

      const accessToken = signAccessToken({
        userId: foundUser.id,
        email: foundUser.email,
      });
      const refreshToken = signRefreshToken({
        userId: foundUser.id,
        email: foundUser.email,
      });

      ctx.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });

      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role as "admin" | "editor" | "viewer" | undefined,
      };
    }),

  refreshToken: publicProcedure.mutation(async ({ ctx }) => {
    // const cookieStore = cookies();
    const refreshToken = ctx.cookies.get("refreshToken")?.value;
    if (!refreshToken)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No refresh token provided",
      });

    let payload: UserJwtPayload | null = null;

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      if (typeof decoded === "string") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }
      payload = decoded as UserJwtPayload;
    } catch {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      });
    }
    if (!payload) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = signAccessToken({ userId: payload?.userId });
    ctx.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return { accessToken: newAccessToken };
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    ctx.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    return { success: true, message: "Logged out successfully" };
  }),

  getMe: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

    return { userID: ctx.session.userId };
  }),
});
