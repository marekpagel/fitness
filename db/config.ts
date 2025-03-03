import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// This is a server-side only file
const connectionString = process.env.POSTGRES_URL_NON_POOLING!;

// Connection for migrations and queries
export const sql = postgres(connectionString, {
  max: 1,
  ssl: {
    rejectUnauthorized: false,
  },
});
export const db = drizzle(sql);
