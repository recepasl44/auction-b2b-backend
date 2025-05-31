// F:\b2b-auction-backend\src\services\BidService.ts
import pool from '../db';
import eventBus from '../events/EventBus';

/**
 * BidService:
 *  - Tekliflerle ilgili iş mantığı, DB sorguları ve event tetiklemeleri.
 */
class BidService {
  /**
   * Yeni teklif ver (INSERT) ve 'NewBidPlaced' eventini yay.
   */
  public static async placeBid(auctionId: number, userId: number, amount: number): Promise<void> {
    const sql = `INSERT INTO bids (auctionId, userId, amount) VALUES (?, ?, ?)`;
    await pool.query(sql, [auctionId, userId, amount]);

    eventBus.emit('NewBidPlaced', { auctionId, userId, amount });
  }
  public static async getBidHistory(auctionId: number): Promise<any[]> {
    const sql = `
      SELECT ai.nickname AS nickname,
             CONCAT(b.amount, b.userCurrency) AS price,
             b.created_at AS date
        FROM bids b
        LEFT JOIN auction_invites ai
          ON ai.auctionId = b.auctionId AND ai.manufacturerId = b.userId
       WHERE b.auctionId = ?
       ORDER BY b.created_at ASC
    `;
    const [rows] = await pool.query(sql, [auctionId]);
    return rows as any[];
  }
  /**
   * Belirli bir açık artırmaya ait teklifleri döndür.
   */
  public static async getBidsForAuction(auctionId: number) {
    const [rows] = await pool.query(`SELECT * FROM bids WHERE auctionId = ?`, [auctionId]);
    return rows;
  }
}

export default BidService;
