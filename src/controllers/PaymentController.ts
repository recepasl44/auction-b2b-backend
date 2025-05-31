// F:\b2b-auction-backend\src\controllers\PaymentController.ts
import { Request, Response } from 'express';
import pool from '../db';
import eventBus from '../events/EventBus'; // <- eventBus import

class PaymentController {
  /**
   * Tüm ödeme planlarını listele
   */
  public static async getAllPaymentSchedules(req: Request, res: Response) {
    try {
      const sql = `SELECT * FROM payment_schedules`;
      const [rows] = await pool.query(sql);
      return res.json({ paymentSchedules: rows });
    } catch (error) {
      console.error('getAllPaymentSchedules Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Belirli bir siparişin ödeme planlarını getir
   */
  public static async getPaymentSchedulesByOrder(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const sql = `SELECT * FROM payment_schedules WHERE order_id = ?`;
      const [rows] = await pool.query(sql, [orderId]);

      return res.json({ paymentSchedules: rows });
    } catch (error) {
      console.error('getPaymentSchedulesByOrder Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Yeni bir ödeme planı oluştur
   */
  public static async createPaymentSchedule(req: Request, res: Response) {
    try {
      // Örnek body: { orderId, paymentType, amount, dueDate, isPaid }
      const { orderId, paymentType, amount, dueDate, isPaid } = req.body;

      const insertSql = `
        INSERT INTO payment_schedules (order_id, payment_type, amount, due_date, is_paid)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertSql, [orderId, paymentType, amount, dueDate, isPaid]);
      const newId = (result as any).insertId;

      return res.status(201).json({
        message: 'Ödeme planı oluşturuldu',
        paymentScheduleId: newId
      });
    } catch (error) {
      console.error('createPaymentSchedule Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ödeme planı güncelleme
   */
  public static async updatePaymentSchedule(req: Request, res: Response) {
    try {
      const scheduleId = parseInt(req.params.id, 10);
      const { paymentType, amount, dueDate, isPaid } = req.body;

      const [existingRows] = await pool.query(`SELECT id FROM payment_schedules WHERE id = ?`, [scheduleId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Ödeme planı kaydı bulunamadı' });
      }

      const updateSql = `
        UPDATE payment_schedules
        SET payment_type = ?, amount = ?, due_date = ?, is_paid = ?
        WHERE id = ?
      `;
      await pool.query(updateSql, [paymentType, amount, dueDate, isPaid, scheduleId]);

      return res.json({
        message: 'Ödeme planı güncellendi',
        paymentScheduleId: scheduleId
      });
    } catch (error) {
      console.error('updatePaymentSchedule Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ödeme planı kaydını silme
   */
  public static async deletePaymentSchedule(req: Request, res: Response) {
    try {
      const scheduleId = parseInt(req.params.id, 10);

      const [existingRows] = await pool.query(`SELECT id FROM payment_schedules WHERE id = ?`, [scheduleId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Ödeme planı kaydı bulunamadı' });
      }

      const deleteSql = `DELETE FROM payment_schedules WHERE id = ?`;
      await pool.query(deleteSql, [scheduleId]);

      return res.json({
        message: 'Ödeme planı silindi',
        paymentScheduleId: scheduleId
      });
    } catch (error) {
      console.error('deletePaymentSchedule Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Bir ödeme planını ödendi olarak işaretle (PaymentReceived Event)
   */
  public static async markPaymentAsPaid(req: Request, res: Response) {
    try {
      const scheduleId = parseInt(req.params.id, 10);

      // DB kaydı al
      const [rows] = await pool.query(`SELECT id, order_id, amount, is_paid FROM payment_schedules WHERE id = ?`, [scheduleId]);
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Ödeme planı kaydı bulunamadı' });
      }

      const paymentRow = (rows as any[])[0];
      if (paymentRow.is_paid) {
        return res.status(400).json({ message: 'Ödeme zaten yapılmış' });
      }

      // isPaid = true
      await pool.query(`UPDATE payment_schedules SET is_paid = true WHERE id = ?`, [scheduleId]);

      // Event emit
      eventBus.emit('PaymentReceived', {
        paymentScheduleId: scheduleId,
        orderId: paymentRow.order_id,
        amount: paymentRow.amount
      });

      return res.json({
        message: 'Ödeme alındı olarak işaretlendi',
        paymentScheduleId: scheduleId
      });
    } catch (error) {
      console.error('markPaymentAsPaid Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default PaymentController;
