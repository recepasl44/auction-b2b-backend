// 2023_01_01_000012_create_auction_invites.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('auction_invites', (table) => {
    table.increments('id').primary();
    table
      .integer('auctionId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('auctions')
      .onDelete('CASCADE');
    table
      .integer('manufacturerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('inviteStatus', 50).notNullable().defaultTo('invited'); // invited, accepted, declined
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auction_invites');
}
