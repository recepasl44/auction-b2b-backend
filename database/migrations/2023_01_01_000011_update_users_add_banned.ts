// örnek dosya: 2023_01_01_000011_update_users_add_banned.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.boolean('banned').notNullable().defaultTo(false);
    // isterseniz table.string('status', 50).defaultTo('active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('banned');
    // table.dropColumn('status');
  });
}
