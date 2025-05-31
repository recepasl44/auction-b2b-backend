// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: 'Authorization header bulunamadı' });
    }
    const token = header.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    // 1) Decode the JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 2) Grab userId from either sub or userId claim
    let userId: number | undefined;
    if (decoded.userId && typeof decoded.userId === 'number') {
      userId = decoded.userId;
    } else if (decoded.sub) {
      userId = parseInt(decoded.sub as string, 10);
    }
    if (!userId) {
      return res.status(401).json({ message: 'Token geçersiz: userId yok' });
    }
    (req as any).userId = userId;

    // 3) Load user from DB
    const [rows] = await pool.query(`
      SELECT id, role_id, is_verified, is_approved, banned
      FROM users
      WHERE id = ?
    `, [userId]);
    const users = rows as any[];
    if (!users.length) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    const user = users[0];

    // 4) Ban, verify, approve checks
    if (user.banned) {
      return res.status(403).json({ message: 'Hesabınız banlanmıştır.' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ message: 'E-posta doğrulanmamış.' });
    }
    if (!user.is_approved) {
      return res.status(403).json({ message: 'Hesabınız onaylanmadı.' });
    }

    // 5) Map role_id → userRole
    let role = 'customer';
    if (user.role_id === 1) role = 'admin';
    else if (user.role_id === 3) role = 'manufacturer';
    (req as any).userRole = role;

    next();
  } catch (err: any) {
    console.error('authMiddleware Error:', err);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
  }
};
