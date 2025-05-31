import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('roles');
  if (!exists) {
    return knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique(); // Örnek: 'superAdmin', 'admin', 'manufacturer', 'customer'
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('roles');
}
