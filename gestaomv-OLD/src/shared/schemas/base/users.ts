import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { idAutoIncrement } from '../../helpers';
import { USER_ROLES_ARRAY, UserRoleType } from '../../constants';

export const users = sqliteTable('users', {
  id: idAutoIncrement(),
  email: text('email').notNull().unique(),
  password: text('password'),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  avatar: text('avatar'),
  authProvider: text('auth_provider').notNull().default('local'), // 'local' | 'tagone'
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const userTagone = sqliteTable('user_tagone', {
  id: idAutoIncrement(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  usuarioTagone: text('usuario_tagone').notNull().unique(),
  tagoneCookie: text('tagone_cookie'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const userRoles = sqliteTable(
  'user_roles',
  {
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role', { enum: USER_ROLES_ARRAY }).notNull().$type<UserRoleType>(),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.role] })],
);

// ===== TYPES =====

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export type User = typeof users.$inferSelect & {
  roles: UserRoleType[];
};
export type NewUser = typeof users.$inferInsert & {
  password?: string;
};

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ one, many }) => ({
  userTagone: one(userTagone, {
    fields: [users.id],
    references: [userTagone.userId],
  }),
  userRoles: many(userRoles),
}));

export const userTagoneRelations = relations(userTagone, ({ one }) => ({
  user: one(users, {
    fields: [userTagone.userId],
    references: [users.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));
