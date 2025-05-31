import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('payment_schedules', (table) => {
    table.increments('id').primary();
    table.integer('order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('payment_type', 50).notNullable().defaultTo('partial');
    table.decimal('amount', 10, 2).notNullable().defaultTo(0);
    table.date('due_date').nullable();
    table.boolean('is_paid').notNullable().defaultTo(false);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('payment_schedules');
}
