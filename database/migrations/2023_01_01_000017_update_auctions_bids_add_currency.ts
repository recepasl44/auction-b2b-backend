// 2023_01_01_000017_update_auctions_bids_add_currency.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('auctions', (table) => {
    table.string('baseCurrency', 10).notNullable().defaultTo('USD');
  });
  await knex.schema.alterTable('bids', (table) => {
    table.string('userCurrency', 10).notNullable().defaultTo('USD');
    table.decimal('amountInBase', 10, 2).notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('auctions', (table) => {
    table.dropColumn('baseCurrency');
  });
  await knex.schema.alterTable('bids', (table) => {
    table.dropColumn('userCurrency');
    table.dropColumn('amountInBase');
  });
}
