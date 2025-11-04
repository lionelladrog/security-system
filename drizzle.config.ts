import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema/userSchema.ts",
  out: "./src/server/db/db.ds",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "safewatch",
    password: process.env.DB_PASSWORD || "safewatch",
    database: process.env.DB_NAME || "safewatch",
  },
} satisfies Config;
