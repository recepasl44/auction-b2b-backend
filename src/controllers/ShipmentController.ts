// F:\b2b-auction-backend\src\controllers\ShipmentController.ts
import { Request, Response } from 'express';
import pool from '../db';

class ShipmentController {
  /**
   * Tüm sevkiyatları listele
   */
  public static async getAllShipments(req: Request, res: Response) {
    try {
      const sql = `SELECT * FROM shipments`;
      const [rows] = await pool.query(sql);
      return res.json({ shipments: rows });
    } catch (error) {
      console.error('getAllShipments Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Belirli bir siparişin sevkiyatlarını getir
   */
  public static async getShipmentsByOrder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const sql = `SELECT * FROM shipments WHERE order_id = ?`;
      const [rows] = await pool.query(sql, [orderId]);

      return res.json({ shipments: rows });
    } catch (error) {
      console.error('getShipmentsByOrder Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Yeni sevkiyat kaydı oluştur
   */
  public static async createShipment(req: Request, res: Response) {
    try {
      const { orderId, shipmentType, containerNo, shipDate, arrivalEstimate, status } = req.body;
      const insertSql = `
        INSERT INTO shipments (order_id, shipment_type, container_no, ship_date, arrival_estimate, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertSql, [
        orderId,
        shipmentType,
        containerNo,
        shipDate,
        arrivalEstimate,
        status
      ]);
      const newId = (result as any).insertId;

      return res.status(201).json({
        message: 'Sevkiyat oluşturuldu',
        shipmentId: newId
      });
    } catch (error) {
      console.error('createShipment Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Sevkiyat güncelleme
   */
  public static async updateShipment(req: Request, res: Response) {
    try {
      const shipmentId = parseInt(req.params.id, 10);
      const { shipmentType, containerNo, shipDate, arrivalEstimate, status } = req.body;

      const [existingRows] = await pool.query(`SELECT id FROM shipments WHERE id = ?`, [shipmentId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Sevkiyat kaydı bulunamadı' });
      }

      const updateSql = `
        UPDATE shipments
        SET shipment_type = ?, container_no = ?, ship_date = ?, arrival_estimate = ?, status = ?
        WHERE id = ?
      `;
      await pool.query(updateSql, [shipmentType, containerNo, shipDate, arrivalEstimate, status, shipmentId]);

      return res.json({
        message: 'Sevkiyat güncellendi',
        shipmentId
      });
    } catch (error) {
      console.error('updateShipment Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Sevkiyat kaydı silme
   */
  public static async deleteShipment(req: Request, res: Response) {
    try {
      const shipmentId = parseInt(req.params.id, 10);

      const [existingRows] = await pool.query(`SELECT id FROM shipments WHERE id = ?`, [shipmentId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Sevkiyat kaydı bulunamadı' });
      }

      const deleteSql = `DELETE FROM shipments WHERE id = ?`;
      await pool.query(deleteSql, [shipmentId]);

      return res.json({
        message: 'Sevkiyat silindi',
        shipmentId
      });
    } catch (error) {
      console.error('deleteShipment Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default ShipmentController;
