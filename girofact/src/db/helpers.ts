import { createId } from "@paralleldrive/cuid2";
import { integer, text } from "drizzle-orm/sqlite-core";

export const idCuid = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => createId());
export const idAutoIncrement = () =>
	integer("id").primaryKey({ autoIncrement: true });

export const createdAt = () =>
	integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date());
export const updatedAt = () =>
	integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date());
export const timestamps = () => ({
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});
