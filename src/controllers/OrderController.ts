// F:\b2b-auction-backend\src\controllers\OrderController.ts
import { Request, Response } from 'express';
import pool from '../db';

/**
 * OrderController
 * - Basit DB sorguları. (Dilerseniz OrderService ekleyebilirsiniz.)
 */
class OrderController {
  public static async getAllOrders(req: Request, res: Response) {
    try {
     const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      let sql = 'SELECT * FROM orders';
      let params: any[] = [];

      if (userRole === 'customer') {
        sql = `SELECT o.* FROM orders o
               LEFT JOIN auctions a ON o.auctionId = a.id
               LEFT JOIN production_requests pr ON a.productionId = pr.id
               WHERE pr.customer_id = ?`;
        params = [userId];
      } else if (userRole === 'manufacturer') {
        sql = `SELECT DISTINCT o.* FROM orders o
               LEFT JOIN auctions a ON o.auctionId = a.id
               LEFT JOIN auction_invites ai ON ai.auctionId = a.id
               WHERE ai.manufacturerId = ?`;
        params = [userId];
      }

      const [rows] = await pool.query(sql, params);
      return res.json({ orders: rows });
    } catch (error) {
      console.error('getAllOrders Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  public static async getOrderById(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id, 10);
    const sql = `SELECT o.*, pr.customer_id, a.id as auctionId
                   FROM orders o
                   LEFT JOIN auctions a ON o.auctionId = a.id
                   LEFT JOIN production_requests pr ON a.productionId = pr.id
                   WHERE o.id = ?`;     
                    const [rows] = await pool.query(sql, [orderId]);

    if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Sipariş bulunamadı' });
      }

      const order = (rows as any[])[0];
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      if (userRole === 'customer' && order.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu siparişi görüntüleyemezsiniz' });
      }

      if (userRole === 'manufacturer') {
        const [invRows] = await pool.query(
          `SELECT id FROM auction_invites WHERE auctionId = ? AND manufacturerId = ?`,
          [order.auctionId, userId]
        );
        if (!(invRows as any[]).length) {
          return res.status(403).json({ message: 'Bu siparişi görüntüleyemezsiniz' });
        }
      }

      return res.json({ order });    } catch (error) {
      console.error('getOrderById Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  public static async createOrder(req: Request, res: Response) {
    try {
      const { musteriId, manufacturerId, auctionId, finalPrice, currency, status } = req.body;
      const insertSql = `
        INSERT INTO orders (musteriId, manufacturerId, auctionId, finalPrice, currency, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertSql, [
        musteriId,
        manufacturerId,
        auctionId,
        finalPrice,
        currency,
        status
      ]);
      const newOrderId = (result as any).insertId;

      return res.status(201).json({
        message: 'Sipariş oluşturuldu',
        orderId: newOrderId
      });
    } catch (error) {
      console.error('createOrder Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  public static async updateOrder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { finalPrice, currency, status } = req.body;

     const [existingRows] = await pool.query(
        `SELECT o.id, pr.customer_id, a.id as auctionId
         FROM orders o
         LEFT JOIN auctions a ON o.auctionId = a.id
         LEFT JOIN production_requests pr ON a.productionId = pr.id
         WHERE o.id = ?`,
        [orderId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Sipariş bulunamadı' });
      }
const userRole = (req as any).userRole;
      const userId = (req as any).userId;
      const record = (existingRows as any[])[0];

      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu siparişi güncelleyemezsiniz' });
      }

      if (userRole === 'manufacturer') {
        const [invRows] = await pool.query(
          `SELECT id FROM auction_invites WHERE auctionId = ? AND manufacturerId = ?`,
          [record.auctionId, userId]
        );
        if (!(invRows as any[]).length) {
          return res.status(403).json({ message: 'Bu siparişi güncelleyemezsiniz' });
        }
      }

      const updateSql = `
        UPDATE orders
        SET finalPrice = ?, currency = ?, status = ?
        WHERE id = ?
      `;
      await pool.query(updateSql, [finalPrice, currency, status, orderId]);

      return res.json({ message: 'Sipariş güncellendi', orderId });
    } catch (error) {
      console.error('updateOrder Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  public static async deleteOrder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id, 10);

 const [existingRows] = await pool.query(
        `SELECT o.id, pr.customer_id, a.id as auctionId
         FROM orders o
         LEFT JOIN auctions a ON o.auctionId = a.id
         LEFT JOIN production_requests pr ON a.productionId = pr.id
         WHERE o.id = ?`,
        [orderId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Sipariş bulunamadı' });
      }
 const userRole = (req as any).userRole;
      const userId = (req as any).userId;
      const record = (existingRows as any[])[0];

      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu siparişi silemezsiniz' });
      }

      if (userRole === 'manufacturer') {
        const [invRows] = await pool.query(
          `SELECT id FROM auction_invites WHERE auctionId = ? AND manufacturerId = ?`,
          [record.auctionId, userId]
        );
        if (!(invRows as any[]).length) {
          return res.status(403).json({ message: 'Bu siparişi silemezsiniz' });
        }
      }
      await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
      return res.json({ message: 'Sipariş silindi', orderId });
    } catch (error) {
      console.error('deleteOrder Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default OrderController;
