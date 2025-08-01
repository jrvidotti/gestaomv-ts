import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "../env";
import * as schema from "./schemas";

const sqlite = new Database(env.DATABASE_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = normal");
sqlite.pragma("temp_store = memory");
sqlite.pragma("mmap_size = 268435456"); // 256MB

export function getDatabase() {
	return drizzle({ client: sqlite, schema });
}

// Configurações específicas para migrations
export function getDatabaseMigrations() {
	const sqlite = new Database(env.DATABASE_PATH);
	sqlite.pragma("foreign_keys = OFF");
	return drizzle({ client: sqlite, schema });
}

export const db = getDatabase();

export { schema };
