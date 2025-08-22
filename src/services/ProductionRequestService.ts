import pool from '../db';

class ProductionRequestService {
  /**
   * Yeni üretim talebi oluştur
   */
  public static async createRequest(
    customerId: number,
    productId: number,
    productName: string
  ): Promise<number> {
    const insertSql = `
      INSERT INTO production_requests
        (customer_id, product_id, product_name, status)
      VALUES (?, ?, ?, 'pending')
    `;
    const [result] = await pool.query(insertSql, [
      customerId,
      productId,
      productName
    ]);
    return (result as any).insertId; // yeni kayıt ID'si
  }


  /**
   * Tüm üretim taleplerini listele (admin için)
   */
  public static async getAllRequests(): Promise<any[]> {
    const sql = `
      SELECT pr.*, 
        p.id AS productId,
        p.name AS productName,
        p.category,
        p.description AS productDescription,
        p.priceType,
        p.destinationPort,
        p.orderQuantity,
        p.createdAt AS productCreatedAt,
        p.updatedAt AS productUpdatedAt,
        u.name AS customerName, u.email AS customerEmail,
        CASE
          WHEN pr.status = 'accepted' AND a.status = 'ended' THEN 'completed'
          ELSE pr.status
        END AS status
        FROM production_requests pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN users u ON pr.customer_id = u.id
        LEFT JOIN auctions a ON a.productionId = pr.id
        ORDER BY pr.id DESC
      `;
    const [rows] = await pool.query(sql);
    return rows as any[];
  }

  /**
   * Belirli bir kullanıcının (müşteri) taleplerini listele
   */
  public static async getRequestsByCustomer(customerId: number): Promise<any[]> {
    const sql = `
      SELECT pr.*, 
        p.id AS productId,
        p.name AS productName,
        p.category,
        p.description AS productDescription,
        p.priceType,
        p.destinationPort,
        p.orderQuantity,
        p.createdAt AS productCreatedAt,
        p.updatedAt AS productUpdatedAt,
        u.name AS customerName, u.email AS customerEmail,
        CASE
          WHEN pr.status = 'accepted' AND a.status = 'ended' THEN 'completed'
          ELSE pr.status
        END AS status
        FROM production_requests pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN users u ON pr.customer_id = u.id
        LEFT JOIN auctions a ON a.productionId = pr.id
        WHERE pr.customer_id = ?
        ORDER BY pr.id DESC
      `;
    const [rows] = await pool.query(sql, [customerId]);
    return rows as any[];
  }

  /**
   * Tek bir üretim talebi
   */
  public static async getRequestById(requestId: number): Promise<any | null> {
    const sql = `
      SELECT pr.*, 
        p.id AS productId,
        p.name AS productName,
        p.category,
        p.description AS productDescription,
        p.priceType,
        p.destinationPort,
        p.orderQuantity,
        p.createdAt AS productCreatedAt,
        p.updatedAt AS productUpdatedAt,
        u.name AS customerName, u.email AS customerEmail,
        CASE
          WHEN pr.status = 'accepted' AND a.status = 'ended' THEN 'completed'
          ELSE pr.status
        END AS status
        FROM production_requests pr
        LEFT JOIN products p ON pr.product_id = p.id
        LEFT JOIN users u ON pr.customer_id = u.id
        LEFT JOIN auctions a ON a.productionId = pr.id
        WHERE pr.id = ?
      `;
    const [rows] = await pool.query(sql, [requestId]);
    if (!(rows as any[]).length) return null;
    return (rows as any[])[0];
  }

  /**
   * Üretim talebini güncelle
   */
  public static async updateRequest(
    requestId: number,
    productName: string,
    description: string,
    shippingType: string,
    quantity: number,
    currency: string
  ): Promise<void> {
    const sql = `
      UPDATE production_requests
      SET product_name = ?, description = ?, shipping_type = ?, quantity = ?, currency = ?
      WHERE id = ?
    `;
    await pool.query(sql, [productName, description, shippingType, quantity, currency, requestId]);
  }

  /**
   * Üretim talebini sil
   */
  public static async deleteRequest(requestId: number): Promise<void> {
    const sql = `DELETE FROM production_requests WHERE id = ?`;
    await pool.query(sql, [requestId]);
  }

  /**
   * Talep onaylama (admin)
   */
  public static async approveRequest(requestId: number): Promise<void> {
    const sql = `UPDATE production_requests SET status = 'accepted' WHERE id = ?`;
    await pool.query(sql, [requestId]);
  }

  /**
   * Talep reddetme (admin)
   */
  public static async rejectRequest(requestId: number): Promise<void> {
    const sql = `UPDATE production_requests SET status = 'rejected' WHERE id = ?`;
    await pool.query(sql, [requestId]);
  }
}

export default ProductionRequestService;
