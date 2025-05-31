// F:\b2b-auction-backend\src\services\ShipmentService.ts
import pool from '../db';

/**
 * ShipmentService:
 *  - Sevkiyat kayıtlarını oluşturma, güncelleme, silme, vb.
 */
class ShipmentService {
  /**
   * Yeni sevkiyat kaydı oluştur.
   */
  public static async createShipment(
    orderId: number,
    shipmentType: string,
    containerNo: string,
    shipDate: string,
    arrivalEstimate: string,
    status: string
  ): Promise<number> {
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
    return (result as any).insertId;
  }

  /**
   * Sevkiyat güncelleme
   */
  public static async updateShipment(
    shipmentId: number,
    shipmentType: string,
    containerNo: string,
    shipDate: string,
    arrivalEstimate: string,
    status: string
  ) {
    const [existingRows] = await pool.query(`SELECT id FROM shipments WHERE id = ?`, [shipmentId]);
    if (!(existingRows as any[]).length) {
      throw new Error('Sevkiyat kaydı bulunamadı.');
    }

    const updateSql = `
      UPDATE shipments
      SET shipment_type = ?, container_no = ?, ship_date = ?, arrival_estimate = ?, status = ?
      WHERE id = ?
    `;
    await pool.query(updateSql, [shipmentType, containerNo, shipDate, arrivalEstimate, status, shipmentId]);
  }

  /**
   * Sevkiyat kaydı silme
   */
  public static async deleteShipment(shipmentId: number) {
    const [existingRows] = await pool.query(`SELECT id FROM shipments WHERE id = ?`, [shipmentId]);
    if (!(existingRows as any[]).length) {
      throw new Error('Sevkiyat kaydı bulunamadı.');
    }
    await pool.query(`DELETE FROM shipments WHERE id = ?`, [shipmentId]);
  }

  /**
   * Tüm sevkiyatları döndür
   */
  public static async getAllShipments() {
    const [rows] = await pool.query(`SELECT * FROM shipments`);
    return rows;
  }

  /**
   * Belirli siparişin sevkiyatlarını döndür
   */
  public static async getShipmentsByOrder(orderId: number) {
    const [rows] = await pool.query(`SELECT * FROM shipments WHERE order_id = ?`, [orderId]);
    return rows;
  }
}

export default ShipmentService;
