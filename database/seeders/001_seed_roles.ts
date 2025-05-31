// F:\b2b-auction-backend\database\seeders\001_seed_roles.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Sil -> Insert
  await knex('roles').del();

  await knex('roles').insert([
    { name: 'admin' },
    { name: 'customer' },
    { name: 'manufacturer' }
  ]);
}
