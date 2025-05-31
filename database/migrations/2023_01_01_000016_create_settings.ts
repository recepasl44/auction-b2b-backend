// 2023_01_01_000016_create_settings.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('key', 100).notNullable().unique();
    table.string('value', 500).notNullable();
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('settings');
}
