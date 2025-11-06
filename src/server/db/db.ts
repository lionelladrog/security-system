import fs from "fs";
import path from "path";
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
// else {
//   // Sinon, vérifier si le fichier local existe
//   const caCertPath = path.resolve(
//     process.cwd(),
//     "server",
//     "db",
//     "certs",
//     "ca.pem"
//   );
//   if (fs.existsSync(caCertPath)) {
//     const caCert = fs.readFileSync(caCertPath);
//     sslConfig = { ca: caCert };
//   }
// }

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: sslConfig,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
