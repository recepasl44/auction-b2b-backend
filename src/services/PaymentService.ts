import pool from '../db';

class ProductService {
  public static async createProduct(
    name: string,
    category: string,
    description: string | null,
    priceType: string,
    destinationPort: string | null,
    orderQuantity: number | null,
    attributes: Record<string, string>,
    imagePath?: string
  ): Promise<number> {
    const insertSql = `
      INSERT INTO products
        (name, category, description, priceType, destinationPort, orderQuantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [
      name,
      category,
      description,
      priceType,
      destinationPort,
      orderQuantity
    ]);
    const newId = (result as any).insertId;

    const values = Object.entries(attributes || {}).map(([k, v]) => [newId, k, v]);
    if (values.length) {
      await pool.query(
        'INSERT INTO product_attributes (productId, attrKey, attrValue) VALUES ?',[values]
      );
    }

    if (imagePath) {
      await pool.query(
        'INSERT INTO product_images (productId, imagePath) VALUES (?, ?)',
        [newId, imagePath]
      );
    }
    return newId;
  }

  public static async getAll(): Promise<any[]> {
    const sql = `
      SELECT p.*, GROUP_CONCAT(pi.imagePath) AS images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.productId
      GROUP BY p.id
      ORDER BY p.id DESC
    `;
    const [rows] = await pool.query(sql);
    return (rows as any[]).map((r) => {
      r.images = r.images ? (r.images as string).split(',') : [];
      return r;
    });
  }

  public static async getById(id: number): Promise<any | null> {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!(rows as any[]).length) return null;
    const product = (rows as any[])[0];
    const [attrs] = await pool.query(
      'SELECT attrKey, attrValue FROM product_attributes WHERE productId = ?',
      [id]
    );
    product.attributes = Object.fromEntries(
      (attrs as any[]).map((r) => [r.attrKey, r.attrValue])
    );

    const [imgs] = await pool.query(
      'SELECT imagePath FROM product_images WHERE productId = ?',
      [id]
    );
    product.images = (imgs as any[]).map((r) => r.imagePath);
    return product;
  }

  public static async updateProduct(
    id: number,
    name: string,
    category: string,
    description: string | null,
    priceType: string,
    destinationPort: string | null,
    orderQuantity: number | null,
    attributes: Record<string, string>,
    imagePath?: string
  ): Promise<void> {
    const sql = `
      UPDATE products
      SET name = ?, category = ?, description = ?, priceType = ?, destinationPort = ?, orderQuantity = ?
      WHERE id = ?
    `;
    await pool.query(sql, [
      name,
      category,
      description,
      priceType,
      destinationPort,
      orderQuantity,
      id
    ]);

    await pool.query('DELETE FROM product_attributes WHERE productId = ?', [id]);
    const values = Object.entries(attributes || {}).map(([k, v]) => [id, k, v]);
    if (values.length) {
      await pool.query(
        'INSERT INTO product_attributes (productId, attrKey, attrValue) VALUES ?',
        [values]
      );
    }

    if (imagePath) {
      await pool.query('DELETE FROM product_images WHERE productId = ?', [id]);
      await pool.query(
        'INSERT INTO product_images (productId, imagePath) VALUES (?, ?)',
        [id, imagePath]
      );
    }
  }

  public static async deleteProduct(id: number): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  }
}

export default ProductService;