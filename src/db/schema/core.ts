import { pgTable, text, timestamp, integer, foreignKey, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { unitTypeEnum } from './enums';
import { organizationalUnitsSeq } from './sequences';
import { users } from './auth';

export const organizationalUnits = pgTable('organizational_units', {
  id: integer('id').primaryKey().default(sql`nextval('organizational_units_id_seq')`).notNull(),
  code: text('code').unique().notNull(),
  name: text('name').notNull(),
  unitType: unitTypeEnum('unit_type').notNull(),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete('set null'),
  };
});

export const resourceScopes = pgTable('resource_scopes', {
  resourceType: text('resource_type').notNull(),
  resourceId: integer('resource_id').notNull(),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'set null' }),
  unitId: integer('unit_id').references(() => organizationalUnits.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.resourceType, table.resourceId] }),
    ownerIdx: index('idx_resource_scopes_owner').on(table.ownerId),
    unitIdx: index('idx_resource_scopes_unit').on(table.unitId),
  };
});
