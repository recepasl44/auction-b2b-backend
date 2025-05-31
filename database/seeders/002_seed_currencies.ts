// F:\b2b-auction-backend\database\seeders\002_seed_currencies.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('currencies').del();

  await knex('currencies').insert([
    { code: 'USD', symbol: '$', exchange_rate: 1.0 },
    { code: 'EUR', symbol: '€', exchange_rate: 0.9 },
    { code: 'TRY', symbol: '₺', exchange_rate: 19.0 }
  ]);
}
