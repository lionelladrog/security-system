// lib/testDb.ts
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/server/db/schema"; // adapte ton chemin

export async function testDbConnection() {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: "DATABASE_URL not set" };
  }

  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 1,
  });

  try {
    const db = drizzle(pool, { schema, mode: "default" });
    await db.execute("SELECT 1"); // simple test
    await pool.end();
    return { success: true };
  } catch (err) {
    await pool.end();
    return { success: false, error: (err as Error).message };
  }
}
