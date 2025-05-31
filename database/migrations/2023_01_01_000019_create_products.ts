import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name', 200).notNullable();
    table.string('category', 100).notNullable();
    table.text('description').nullable();
    table.string('priceType', 10).notNullable(); // CIF or FOB
    table.string('destinationPort', 100).nullable();
    table.integer('orderQuantity').unsigned().nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('product_attributes', (table) => {
    table.increments('id').primary();
    table
      .integer('productId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products')
      .onDelete('CASCADE');
    table.string('attrKey', 100).notNullable();
    table.string('attrValue', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('product_attributes');
  await knex.schema.dropTableIfExists('products');
}