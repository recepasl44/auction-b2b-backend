import { Request, Response } from 'express';
import pool from '../db';
import fs from 'fs/promises';
import { fileUrl } from '../utils/url';

class ProfileController {
  public static async uploadImage(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!req.file) {
        return res.status(400).json({ message: 'Görsel bulunamadı.' });
      }
      await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [req.file.path, userId]);
      const url = fileUrl(req.protocol, req.get('host') || '', req.file.path);
      return res.json({ message: 'Profil resmi güncellendi', path: url });
    } catch (error) {
      console.error('uploadImage Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  public static async deleteImage(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const [rows] = await pool.query('SELECT profile_image FROM users WHERE id = ?', [userId]);
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      const imgPath = (rows as any[])[0].profile_image as string | null;
      if (imgPath) {
        try {
          await fs.unlink(imgPath);
        } catch (err) {
          console.error('unlink error:', err);
        }
      }
      await pool.query('UPDATE users SET profile_image = NULL WHERE id = ?', [userId]);
      return res.json({ message: 'Profil resmi silindi' });
    } catch (error) {
      console.error('deleteImage Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default ProfileController;
