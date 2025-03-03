import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create the connection
const client = postgres(process.env.POSTGRES_URL!);

// Create the Drizzle client
export const db = drizzle(client, { schema });

// Export the schema
export * from "./schema";
