import type { UserRoleType } from "@/constants";
import { idAutoIncrement } from "@/db/helpers";
import { relations, sql } from "drizzle-orm";
import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: idAutoIncrement(),
	email: text("email").notNull().unique(),
	password: text("password"),
	name: text("name").notNull(),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	avatar: text("avatar"),
	authProvider: text("auth_provider").notNull().default("local"), // 'local' | 'tagone'
	createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const userRoles = sqliteTable(
	"user_roles",
	{
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		role: text("role").notNull().$type<UserRoleType>(),
		createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
	},
	(table) => [primaryKey({ columns: [table.userId, table.role] })],
);

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ one, many }) => ({
	userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
	}),
}));
