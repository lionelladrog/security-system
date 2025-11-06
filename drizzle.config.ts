import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema/userSchema.ts",
  out: "./src/server/db/db.ds",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
} satisfies Config;
