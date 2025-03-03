import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  dialect: "postgresql",
} satisfies Config;
