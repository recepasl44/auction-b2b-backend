// F:\b2b-auction-backend\src\controllers\ReportController.ts
import { Request, Response } from 'express';
import pool from '../db';

class ReportController {
  /**
   * Sistem özet raporu
   */
  public static async getSummary(req: Request, res: Response) {
    try {
      const sqlAuctions = 'SELECT COUNT(*) as totalAuctions FROM auctions';
      const sqlOrders = 'SELECT COUNT(*) as totalOrders FROM orders';
      const sqlUsers = 'SELECT COUNT(*) as totalUsers FROM users';

      const [[auctionsResult], [ordersResult], [usersResult]] = await Promise.all([
        pool.query(sqlAuctions),
        pool.query(sqlOrders),
        pool.query(sqlUsers)
      ]);

      const totalAuctions = (auctionsResult as any[])[0].totalAuctions;
      const totalOrders = (ordersResult as any[])[0].totalOrders;
      const totalUsers = (usersResult as any[])[0].totalUsers;

      return res.json({
        message: 'Sistem özet raporu',
        data: {
          totalAuctions,
          totalOrders,
          totalUsers
        }
      });
    } catch (error) {
      console.error('getSummary Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
// ReportController.ts
public static async getWhoWonAuctions(req: Request, res: Response) {
  try {
    const sql = `
      SELECT a.id as auctionId, a.title, a.status, b.userId as winnerId, MAX(b.amount) as winningBid
      FROM auctions a
      LEFT JOIN bids b ON a.id = b.auctionId
      WHERE a.status = 'ended'
      GROUP BY a.id
    `;
    const [rows] = await pool.query(sql);
    return res.json({ endedAuctions: rows });
  } catch (error) {
    console.error('getWhoWonAuctions Error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
}

  /**
   * Tarih aralığına göre açık artırma & sipariş sayısı
   */
  public static async getAuctionsAndOrdersByDateRange(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ message: 'Lütfen start ve end parametrelerini girin (YYYY-MM-DD)' });
      }

      const startDate = String(start);
      const endDate = String(end);

      const sqlAuctions = `
        SELECT COUNT(*) as auctionsCount
        FROM auctions
        WHERE DATE(createdAt) BETWEEN ? AND ?
      `;
      const sqlOrders = `
        SELECT COUNT(*) as ordersCount
        FROM orders
        WHERE DATE(createdAt) BETWEEN ? AND ?
      `;

      const [[auctionRows], [orderRows]] = await Promise.all([
        pool.query(sqlAuctions, [startDate, endDate]),
        pool.query(sqlOrders, [startDate, endDate])
      ]);

      const auctionsCount = (auctionRows as any[])[0].auctionsCount;
      const ordersCount = (orderRows as any[])[0].ordersCount;

      return res.json({
        message: 'Tarih aralığı raporu',
        data: { startDate, endDate, auctionsCount, ordersCount }
      });
    } catch (error) {
      console.error('getAuctionsAndOrdersByDateRange Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * En çok teklif alan açık artırmalar
   */
  public static async getTopBiddedAuctions(req: Request, res: Response) {
    try {
      const sql = `
        SELECT a.id AS auctionId, a.title, COUNT(b.id) AS bidCount
        FROM auctions a
        LEFT JOIN bids b ON a.id = b.auctionId
        GROUP BY a.id
        ORDER BY bidCount DESC
        LIMIT 5
      `;
      const [rows] = await pool.query(sql);
      return res.json({
        message: 'En çok teklif alan açık artırmalar',
        auctions: rows
      });
    } catch (error) {
      console.error('getTopBiddedAuctions Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default ReportController;
