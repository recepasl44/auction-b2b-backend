import pool from '../db';
import eventBus from '../events/EventBus';


class AuctionService {
  /**
   * Yeni bir açık artırma oluşturur (status = 'planned')
   */
  public static async createAuction(
    title: string,
    startTime: string,
    endTime: string,
    startPrice: number,
    
    endPrice: number,
    incrementStep: number,
    baseCurrency: string,
    sortDirection: string,
    productionId: number
  ): Promise<number> {
    const insertSql = `
      INSERT INTO auctions (title, startTime, endTime, startPrice, endPrice, incrementStep, baseCurrency, sortDirection, productionId, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned')
    `;
    const [result] = await pool.query(insertSql, [
      title,
      startTime,
      endTime,
      startPrice,
      endPrice,
      incrementStep,
      baseCurrency,
      sortDirection,
      productionId
    ]);    const newId = (result as any).insertId;
    return newId;
  }

  /**
   * Açık artırmayı başlat (status = 'active') ve 'AuctionStarted' eventini tetikle.
   */
  public static async startAuction(auctionId: number): Promise<void> {
    // Kontrol
    const [rows] = await pool.query(`SELECT id FROM auctions WHERE id = ?`, [auctionId]);
    if (!(rows as any[]).length) {
      throw new Error('Açık artırma bulunamadı.');
    }

    // Güncelle
    await pool.query(`UPDATE auctions SET status = 'active' WHERE id = ?`, [auctionId]);

    // Event
    eventBus.emit('AuctionStarted', { auctionId });
  }

  /**
   * Açık artırmayı bitir (status = 'ended'), en yüksek teklifi veren user'ı bul,
   * 'AuctionEnded' eventini tetikle.
   */
  public static async endAuction(auctionId: number): Promise<{ winner: number | null }> {
    const [rows] = await pool.query(`SELECT id FROM auctions WHERE id = ?`, [auctionId]);
    if (!(rows as any[]).length) {
      throw new Error('Açık artırma bulunamadı.');
    }

    // Kazanan
    const [bidRows] = await pool.query(`
      SELECT userId, amountInBase
      FROM bids
      WHERE auctionId = ?
      ORDER BY amountInBase DESC
      LIMIT 1
    `, [auctionId]);
  
    const winner = (bidRows as any[]).length ? (bidRows as any[])[0].userId : null;
    const finalPrice = (bidRows as any[]).length ? (bidRows as any[])[0].amountInBase : 0;

    await pool.query(`UPDATE auctions SET status = 'ended' WHERE id = ?`, [auctionId]);

    eventBus.emit('AuctionEnded', { auctionId, winnerId: winner });
    return { winner };
  }

  /**
   * Tüm açık artırmaları döndür.
   */
  public static async getAllAuctions() {
    const [rows] = await pool.query(`SELECT * FROM auctions`);
    return rows;
  }

  /**
   * Tek bir açık artırma
   */
  public static async getAuctionById(auctionId: number) {
    const [rows] = await pool.query(`SELECT * FROM auctions WHERE id = ?`, [auctionId]);
    if (!(rows as any[]).length) return null;
    return (rows as any[])[0];
  }
}

export default AuctionService;
