import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('shipments', (table) => {
    table.increments('id').primary();
    table.integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('shipment_type', 50).notNullable().defaultTo('sea');
    table.string('container_no', 100).nullable();
    table.dateTime('ship_date').nullable();
    table.dateTime('arrival_estimate').nullable();
    table.string('status', 50).defaultTo('planned');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('shipments');
}
