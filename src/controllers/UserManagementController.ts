import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import NotificationService from '../services/NotificationService';

class UserManagementController {
  /**
   * Tüm kullanıcıları listele
   */
  public static async getAllUsers(req: Request, res: Response) {
    try {
      const { name, role_id, email } = req.query;

      const conditions: string[] = [];
      const params: any[] = [];

      if (name) {
        conditions.push('name LIKE ?');
        params.push(`%${name}%`);
      }

      if (role_id) {
        conditions.push('role_id = ?');
        params.push(role_id);
      }

      if (email) {
        conditions.push('email LIKE ?');
        params.push(`%${email}%`);
      }

      let sql = `SELECT id, email, name, role_id, is_verified, is_approved FROM users`;
      if (conditions.length) {
        sql += ` WHERE ` + conditions.join(' AND ');
      }

      const [rows] = await pool.query(sql, params);
      return res.json({ users: rows });
    } catch (error) {
      console.error('getAllUsers Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Tek bir kullanıcı detayı
   */
  public static async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      const sql = `SELECT id, email, name, role_id, is_verified, is_approved FROM users WHERE id = ?`;
      const [rows] = await pool.query(sql, [userId]);

      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      return res.json({ user: (rows as any[])[0] });
    } catch (error) {
      console.error('getUserById Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcı oluşturma (Admin tarafından)
   */
  public static async createUser(req: Request, res: Response) {
    try {
      const { email, password, name, role_id } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users (email, password, name, role_id, is_verified, is_approved)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      // Admin eklerken belki direkt is_verified=true ve is_approved=true yapabilirsiniz.
      const [result] = await pool.query(insertSql, [email, hashedPassword, name, role_id, true, true]);
      const newId = (result as any).insertId;

      return res.status(201).json({
        message: 'Kullanıcı eklendi',
        userId: newId
      });
    } catch (error) {
      console.error('createUser Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcı güncelleme
   */
  public static async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { email, name, role_id } = req.body;

      const [existingRows] = await pool.query(`SELECT id FROM users WHERE id = ?`, [userId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const updateSql = `
        UPDATE users
        SET email = ?, name = ?, role_id = ?
        WHERE id = ?
      `;
      await pool.query(updateSql, [email, name, role_id, userId]);

      return res.json({ message: 'Kullanıcı güncellendi', userId });
    } catch (error) {
      console.error('updateUser Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcı şifresini değiştirme
   */
  public static async updateUserPassword(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { newPassword } = req.body;

      const [existingRows] = await pool.query(`SELECT id FROM users WHERE id = ?`, [userId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashed, userId]);

      return res.json({ message: 'Kullanıcı şifresi güncellendi', userId });
    } catch (error) {
      console.error('updateUserPassword Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcı silme
   */
  public static async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);

      const [existingRows] = await pool.query(`SELECT id FROM users WHERE id = ?`, [userId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
      return res.json({ message: 'Kullanıcı silindi', userId });
    } catch (error) {
      console.error('deleteUser Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * [Yeni] Kullanıcıyı admin onayla (is_approved = true)
   */
  public static async approveUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      const [existingRows] = await pool.query(`SELECT id, is_approved, email FROM users WHERE id = ?`, [userId]);
      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const user = (existingRows as any[])[0];
      if (user.is_approved) {
        return res.status(400).json({ message: 'Kullanıcı zaten onaylanmış.' });
      }

      await pool.query(`UPDATE users SET is_approved = true WHERE id = ?`, [userId]);

      // Opsiyonel e-posta: "Hesabınız onaylandı, artık giriş yapabilirsiniz" vs.
      try {
        await NotificationService.sendEmail(
          user.email,
          'Hesabınız onaylandı',
          `Merhaba, hesabınız yönetici tarafından onaylandı. Artık giriş yapabilirsiniz.`
        );
      } catch (mailErr) {
        console.error('Mail gönderilemedi:', mailErr);
      }

      return res.json({ message: 'Kullanıcı onaylandı', userId });
    } catch (error) {
      console.error('approveUser Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  public static async banUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      const [rows] = await pool.query(`SELECT id, banned FROM users WHERE id = ?`, [userId]);
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
  
      await pool.query(`UPDATE users SET banned = true WHERE id = ?`, [userId]);
      return res.json({ message: 'Kullanıcı banlandı', userId });
    } catch (error) {
      console.error('banUser Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default UserManagementController;
