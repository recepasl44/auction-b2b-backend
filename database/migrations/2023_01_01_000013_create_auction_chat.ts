// 2023_01_01_000013_create_auction_chat.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('auction_chat', (table) => {
    table.increments('id').primary();
    table
      .integer('auctionId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('auctions')
      .onDelete('CASCADE');
    table.string('nickname', 50).notNullable(); // rastgele takma ad
    table.string('message', 500).notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auction_chat');
}
