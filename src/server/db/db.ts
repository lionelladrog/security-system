import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

let sslConfig;

if (process.env.DB_CA_CERT) {
  sslConfig = { ca: process.env.DB_CA_CERT };
}

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: sslConfig,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
