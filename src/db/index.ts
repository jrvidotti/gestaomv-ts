import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../env";
import * as schema from "./schemas";

const sqlite = new Database(env.DATABASE_PATH);
export const db = drizzle({ client: sqlite, schema });

export const getDatabase = () => db;

export { schema };
