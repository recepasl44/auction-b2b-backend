import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('bids', (table) => {
    table.increments('id').primary();
    table
      .integer('auctionId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('auctions')
      .onDelete('CASCADE');
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')  // <--- references('id').inTable('users')
      .onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bids');
}
