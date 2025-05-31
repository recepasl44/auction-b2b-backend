// 2023_01_01_000014_update_auctions_add_endPrice_incrementStep.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('auctions', (table) => {
    table.decimal('endPrice', 10, 2).nullable();
    table.decimal('incrementStep', 10, 2).notNullable().defaultTo(1); // varsayılan artış
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('auctions', (table) => {
    table.dropColumn('endPrice');
    table.dropColumn('incrementStep');
  });
}
