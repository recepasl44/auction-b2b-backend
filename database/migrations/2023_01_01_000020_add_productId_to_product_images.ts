import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('product_images', (table) => {
    table.integer('productId').unsigned().nullable().references('id').inTable('products').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('product_images', (table) => {
    table.dropColumn('productId');
  });
}