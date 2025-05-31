// F:\b2b-auction-backend\database\seeders\003_seed_users.ts
import { Knex } from 'knex';
import bcrypt from 'bcrypt';

/**
 * Örnek kullanıcılar eklenir. Admin rol_id = 1, 
 * Müşteri rol_id = 2, Üretici rol_id = 3 (seed_roles'ta eklediğimiz)
 */
export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashCustomer = await bcrypt.hash('customer123', 10);
  const passwordHashManufacturer = await bcrypt.hash('man123', 10);

  await knex('users').insert([
    {
      email: 'admin@test.com',
      password: passwordHashAdmin,
      name: 'Admin User',
      role_id: 1
    },
    {
      email: 'customer@test.com',
      password: passwordHashCustomer,
      name: 'Customer User',
      role_id: 2
    },
    {
      email: 'manufacturer@test.com',
      password: passwordHashManufacturer,
      name: 'Manufacturer User',
      role_id: 3
    }
  ]);
}
