import pool from '../db';

class ProductAttributeService {
  public static async getAttributes(productId: number): Promise<any[]> {
    const [rows] = await pool.query(
      'SELECT * FROM product_attributes WHERE productId = ?',
      [productId]
    );
    return rows as any[];
  }

  public static async createAttribute(
    productId: number,
    attrKey: string,
    attrValue: string
  ): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO product_attributes (productId, attrKey, attrValue) VALUES (?, ?, ?)',
      [productId, attrKey, attrValue]
    );
    return (result as any).insertId;
  }

  public static async updateAttribute(
    id: number,
    attrKey: string,
    attrValue: string
  ): Promise<void> {
    await pool.query(
      'UPDATE product_attributes SET attrKey = ?, attrValue = ? WHERE id = ?',
      [attrKey, attrValue, id]
    );
  }

  public static async deleteAttribute(id: number): Promise<void> {
    await pool.query('DELETE FROM product_attributes WHERE id = ?', [id]);
  }
}

export default ProductAttributeService;