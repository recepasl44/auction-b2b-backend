// OrderService.ts
import pool from '../db';

class OrderService {
  /**
   * Kazanan için sipariş oluştur
   */
  public static async createOrderForWinner(auctionId: number, winnerId: number): Promise<number> {
    // finalPrice = en yüksek teklif
    const [rows] = await pool.query(`
      SELECT amount
      FROM bids
      WHERE auctionId = ?
      ORDER BY amount DESC
      LIMIT 1
    `, [auctionId]);
    if (!(rows as any[]).length) {
      return 0; // hiç teklif yok
    }
    const finalPrice = (rows as any[])[0].amount;

    // Sipariş kaydı
    const insertSql = `
      INSERT INTO orders (auctionId, musteriId, manufacturerId, finalPrice, currency, status)
      VALUES (?, ?, ?, ?, 'USD', 'new')
    `;
    // "musteriId" kurgunuza göre eğer "winner" = üretici mi müşteri mi? 
    // Bazı projelerde "winner" = üreticiyse "manufacturerId" alanına atarız, 
    // musteriId'yi ise productionRequest'in customer_id'sinden alırız. 
    // Bu tamamen sizin senaryonuza bağlı.
    const [result] = await pool.query(insertSql, [auctionId, 0, winnerId, finalPrice]); 
    // 0 => musteriId (eğer gerekliyse)...

    return finalPrice;
  }
}

export default OrderService;
