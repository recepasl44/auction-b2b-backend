import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // => UNSIGNED INT
    table.string('email', 100).unique().notNullable();
    table.string('password', 200).notNullable();
    table.string('name', 100).notNullable();
    table.integer('role_id').unsigned().references('id').inTable('roles');
    table.timestamps(true, true); // createdAt, updatedAt
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
