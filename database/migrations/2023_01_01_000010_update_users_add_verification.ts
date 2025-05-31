import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    // E-posta doğrulama
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.string('verification_token', 200).nullable();

    // Admin onayı
    table.boolean('is_approved').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_verified');
    table.dropColumn('verification_token');
    table.dropColumn('is_approved');
  });
}
