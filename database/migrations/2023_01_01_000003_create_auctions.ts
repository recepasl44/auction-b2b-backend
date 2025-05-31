import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('auctions', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.dateTime('startTime').nullable();
    table.dateTime('endTime').nullable();
    table.decimal('startPrice', 10, 2).notNullable().defaultTo(0);
    table.string('status', 50).notNullable().defaultTo('planned');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('auctions');
}
