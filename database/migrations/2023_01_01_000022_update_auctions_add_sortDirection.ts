import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('auctions', (table) => {
    table.string('sortDirection', 10).notNullable().defaultTo('asc');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('auctions', (table) => {
    table.dropColumn('sortDirection');
  });
}
