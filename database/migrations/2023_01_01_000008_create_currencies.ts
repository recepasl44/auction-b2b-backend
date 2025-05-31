import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('currencies', (table) => {
    table.increments('id').primary();
    table.string('code', 10).notNullable().unique();
    table.string('symbol', 10).nullable();
    table.decimal('exchange_rate', 10, 4).notNullable().defaultTo(1.0); // USD baz alınabilir
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('currencies');
}
