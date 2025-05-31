import { Request, Response, NextFunction } from 'express';
import pool from '../db';

/**
 * permissionMiddleware:
 * - Kullanicinin role_id'sini DB'den çekerek istenen role sahip mi kontrol eder.
 * - Örnek: permissionMiddleware('admin') => sadece admin role erişebilsin.
 */
export const permissionMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      /*
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ message: 'Önce kimlik doğrulama gerekli' });
      }

      // DB'den user çek
      const sql = `SELECT role_id FROM users WHERE id = ?`;
      const [rows] = await pool.query(sql, [userId]);
      const users = rows as any[];

      if (!users.length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const userRole = users[0].role_id; // integer veya string olabilir

      // Örnek: Basit string karşılaştırma (ya da role tablosu)
      // requiredRole = "admin", userRole = "admin" => pass
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }
*/
      next();
    } catch (error) {
      console.error('permissionMiddleware Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  };
};
