import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // rastgele token için
import pool from '../db';
import NotificationService from '../services/NotificationService'; // opsiyonel e-posta

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

class AuthController {
  /**
   * [1] Register: E-posta doğrulaması için verification_token üretelim.
   */
  public static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role_id } = req.body;

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);

      // Rastgele doğrulama tokeni
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // DB'ye kaydet
      // is_verified = false, is_approved = false
      const insertSql = `
        INSERT INTO users (email, password, name, role_id, is_verified, verification_token, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(insertSql, [
        email,
        hashedPassword,
        name,
        role_id,
        false,
        verificationToken,
        false
      ]);
      const userId = (result as any).insertId;

      // Opsiyonel: Doğrulama maili gönder
      // verify link: http://frontend-url.com/verify?token=xxx  veya /api/auth/verifyEmail?token=xxx
      const verifyLink = `${process.env.FRONTEND_URL || 'https://panel.demaxtore.com'}/verifyEmail?token=${verificationToken}`;

      try {
        const html = `<p>Merhaba ${name},</p><p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın.</p><p><a href="${verifyLink}">Hesabı Doğrula</a></p>`;
        await NotificationService.sendEmail(
          email,
          'E-posta Doğrulama',
          `Hesabınızı doğrulamak için link: ${verifyLink}`,
          html
        );
      } catch (mailErr) {
        console.error('Mail gönderme hatası:', mailErr);
      }

      return res.status(201).json({
        message: 'Kullanıcı oluşturuldu. Lütfen e-postanızı doğrulayın.',
        user: { id: userId, email, name, role_id }
      });
    } catch (error) {
      console.error('Register Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' ,error});
    }
  }

  /**
   * [2] E-posta doğrulama (verification_token kontrolü)
   */
  public static async verifyEmail(req: Request, res: Response) {
    try {
     const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token bulunamadı.' });
  }
      // DB'de bu token var mı?
      const selectSql = `
        SELECT id, email, is_verified
        FROM users
        WHERE verification_token = ?
      `;
      const [rows] = await pool.query(selectSql, [token]);
      const users = rows as Array<any>;

      if (!users.length) {
        return res.status(400).json({ message: 'Geçersiz token veya kullanıcı yok.' });
      }

      const user = users[0];
      if (user.is_verified) {
        return res.status(400).json({ message: 'Hesap zaten doğrulanmış.' });
      }

      // is_verified = true, token'i boşalt
      const updateSql = `
        UPDATE users
        SET is_verified = true, verification_token = NULL
        WHERE id = ?
      `;
      await pool.query(updateSql, [user.id]);

      return res.json({ message: 'E-posta doğrulama başarılı. Artık giriş yapabilirsiniz.' });
    } catch (error) {
      console.error('verifyEmail Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * [3] Login: is_verified ve is_approved kontrolü
   */
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
 

      const selectSql = `
        SELECT id, email, password, name, is_verified, is_approved, role_id
        FROM users
        WHERE email = ?
      `;
      const [rows] = await pool.query(selectSql, [email]);
      const users = rows as Array<any>;

      if (!users.length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı'});
      }

      const user = users[0];
      // Şifre karşılaştırma
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Geçersiz şifre' });
      }

      // E-posta doğrulanmış mı?
      if (!user.is_verified) {
        return res
          .status(403)
          .json({ message: 'Hesabınız doğrulanmamış. Lütfen e-postanızı kontrol edin.' });
      }

      // Admin onayı yapılmış mı?
      if (!user.is_approved) {
        return res
          .status(403)
          .json({ message: 'Hesabınız henüz yönetici tarafından onaylanmadı.' });
      }

      // JWT oluştur
 const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '1h'
      });

      const refreshToken = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, refreshToken, expiresAt]
      );
      return res.json({
        message: 'Giriş başarılı',
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role_id: user.role_id
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ message: error });
    }
  }
  public static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: 'refreshToken gerekli' });
      }

      // Refresh token DB'de mevcut mu ve süresi dolmamış mı?
      const [rows] = await pool.query(
        `SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
        [refreshToken]
      );
      if (!(rows as any[]).length) {
        return res.status(401).json({ message: 'Geçersiz refresh token' });
      }

      const userId = (rows as any[])[0].user_id;

      // Yeni access token oluştur
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

      // Refresh token rotasyonu: yeni refresh token üret ve eski kaydı güncelle
      const newRefreshToken = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        `UPDATE refresh_tokens SET token = ?, expires_at = ? WHERE token = ?`,
        [newRefreshToken, expiresAt, refreshToken]
      );

      return res.json({ token, refreshToken: newRefreshToken });
    } catch (err) {
      console.error('refreshToken Error:', err);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  /**
   * [4] Profil
   */
  public static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const selectSql = `SELECT id, email, name, role_id, is_verified, is_approved FROM users WHERE id = ?`;
      const [rows] = await pool.query(selectSql, [userId]);
      const users = rows as Array<any>;

      if (!users.length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      const user = users[0];
      return res.json({
        message: 'Profil bilgisi',
        user
      });
    } catch (error) {
      console.error('Profile Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  public static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const [rows] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
  
      const user = (rows as any[])[0];
      const resetToken = crypto.randomBytes(32).toString('hex');
      // DB'ye resetToken kaydet (yeni kolon "reset_token")
      await pool.query(`UPDATE users SET reset_token = ? WHERE id = ?`, [resetToken, user.id]);
  
      // Mail gönder
      const resetLink = `${process.env.FRONTEND_URL || 'https://panel.demaxtore.com'}/resetPassword?token=${resetToken}`;
      const html = `<p>Merhaba,</p><p>Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanabilirsiniz.</p><p><a href="${resetLink}">Şifreyi Sıfırla</a></p>`;
      await NotificationService.sendEmail(
        email,
        'Şifre Sıfırlama',
        `Şifrenizi sıfırlamak için link: ${resetLink}`,
        html
      );
  
      return res.json({ message: 'Şifre sıfırlama maili gönderildi' });
    } catch (error) {
      console.error('forgotPassword Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  public static async resetPassword(req: Request, res: Response) {
    try {
   const { token, newPassword } = req.body;
  const [rows] = await pool.query(`
    SELECT id FROM users WHERE reset_token = ?
  `, [token]);
  if (!(rows as any[]).length) {
    return res.status(400).json({ message: 'Geçersiz token' });
  }
      const user = (rows as any[])[0];
      const hashed = await bcrypt.hash(newPassword, 10);
  
      await pool.query(`UPDATE users SET password=?, reset_token=NULL WHERE id=?`, [hashed, user.id]);
  
      return res.json({ message: 'Şifre sıfırlandı' });
    } catch (err) {
      console.error('resetPassword Error:', err);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
   
  

  
}

export default AuthController;
