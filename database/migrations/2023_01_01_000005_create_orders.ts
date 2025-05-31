import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();

    // eğer foreign key silinince 'auctionId' alanını NULL yapmak istiyorsanız:
    table.integer('auctionId').unsigned().nullable()
      .references('id')
      .inTable('auctions')
      .onDelete('SET NULL'); 

    // eğer 'auctionId' hiçbir zaman NULL olmayacaksa 'notNullable' yapın
    // ama o durumda onDelete('CASCADE') veya onDelete('RESTRICT') gibi kullanılabilir:
    // table.integer('auctionId').unsigned().notNullable()
    //   .references('id').inTable('auctions')
    //   .onDelete('CASCADE');

    // Örneğin musteriId, manufacturerId da eklenebilir
    table.decimal('finalPrice', 10, 2).notNullable().defaultTo(0);
    table.string('currency', 10).notNullable().defaultTo('USD');
    table.string('status', 50).notNullable().defaultTo('new');

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('orders');
}
