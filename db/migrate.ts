import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const runMigrate = async () => {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    throw new Error("POSTGRES_URL_NON_POOLING is not defined");
  }

  const sql = postgres(connectionString, {
    max: 1,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const db = drizzle(sql);

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "drizzle" });

  console.log("Migrations complete!");

  await sql.end();
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
