import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "./db/db";
import { cookies } from "next/headers";

export async function createContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let session: { userId: string; email: string } | null = null;

  if (accessToken) {
    try {
      const payload = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      ) as JwtPayload & { userId: string; email: string };
      session = { userId: payload.userId, email: payload.email };
    } catch {
      session = null;
    }
  }

  return {
    db,
    session,
    cookies: cookieStore,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
