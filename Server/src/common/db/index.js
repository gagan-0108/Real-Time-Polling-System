import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config/env.js";
import * as schema from "./schema.js";

const pool = new Pool({
	connectionString: config.databaseUrl,
	max: 20,
	idleTimeoutMillis: 30_000,
});

const db = drizzle(pool, { schema });

export { db, pool, schema };
