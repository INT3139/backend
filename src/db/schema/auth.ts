import { pgTable, text, boolean, timestamp, primaryKey, unique, index, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizationalUnits } from './core';
import { scopeTypeEnum } from './enums';
import { rolesSeq, permissionsSeq, usersSeq, userRolesSeq } from './sequences';

export const roles = pgTable('roles', {
  id: integer('id').primaryKey().default(sql`nextval('roles_id_seq')`).notNull(),
  code: text('code').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const permissions = pgTable('permissions', {
  id: integer('id').primaryKey().default(sql`nextval('permissions_id_seq')`).notNull(),
  code: text('code').unique().notNull(),
  description: text('description'),
  domain: text('domain').generatedAlwaysAs(sql`split_part(code, '.', 1)`),
  module: text('module').generatedAlwaysAs(sql`split_part(code, '.', 2)`),
  action: text('action').generatedAlwaysAs(sql`split_part(code, '.', 3)`),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    domainModuleIdx: index('idx_permissions_domain_module').on(table.domain, table.module),
  };
});

export const rolePermissions = pgTable('role_permissions', {
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionCode: text('permission_code').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roleId, table.permissionCode] }),
    codeIdx: index('idx_role_perms_code').on(table.permissionCode),
  };
});

export const users = pgTable('users', {
  id: integer('id').primaryKey().default(sql`nextval('users_id_seq')`).notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  unitId: integer('unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    activeIdx: index('idx_users_active').on(table.isActive).where(sql`is_active = true`),
    unitIdx: index('idx_users_unit').on(table.unitId),
  };
});

export const userRoles = pgTable('user_roles', {
  id: integer('id').primaryKey().default(sql`nextval('user_roles_id_seq')`).notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  scopeType: scopeTypeEnum('scope_type').default('school').notNull(),
  scopeUnitId: integer('scope_unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  grantedBy: integer('granted_by').references(() => users.id, { onDelete: 'set null' }),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.roleId, table.scopeUnitId),
    expiresIdx: index('idx_user_roles_expires').on(table.expiresAt).where(sql`expires_at IS NOT NULL`),
    userIdx: index('idx_user_roles_user').on(table.userId),
  };
});
