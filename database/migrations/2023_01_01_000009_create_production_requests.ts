import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('production_requests', (table) => {
    table.increments('id').primary();
    table

        .integer('customer_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
  
      table.integer('productionId')

    table.string('product_name', 200).notNullable();
    table.string('description', 500).nullable();
    table.string('shipping_type', 50).notNullable().defaultTo('sea'); // deniz, hava, kara
    table.decimal('quantity', 10, 2).notNullable().defaultTo(0);
    table.string('currency', 10).notNullable().defaultTo('USD');

    // pending / approved / rejected
    table.string('status', 50).notNullable().defaultTo('pending');

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('production_requests');
}
