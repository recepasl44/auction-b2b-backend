import { Request, Response } from 'express';
import ProductionRequestService from '../services/ProductionRequestService';
import ProductService from '../services/ProductService';

import NotificationService from '../services/NotificationService'; // Opsiyonel e-posta
import pool from '../db';

class ProductionRequestController {
  /**
   * [Müşteri veya Admin] Yeni üretim talebi oluşturma
   */
  public static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { productId } = req.body;
      const pid = parseInt(productId, 10);
      const product = await ProductService.getById(pid);
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı' });
      }

      const newId = await ProductionRequestService.createRequest(
        userId,
        pid,
        product.name
      );
      console.log('Yeni üretim talebi oluşturuldu:', newId);

      const [userRows] = await pool.query(
        'SELECT email, name FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      const user = (userRows as any[])[0];
      try {
        const detailLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/requests/${newId}`;
        const html = `<p>Sayın ${user.name},</p><p>${product.name} ürünü için üretim talebiniz alınmıştır.</p><p>Detaylar için <a href="${detailLink}">tıklayın</a>.</p>`;
        await NotificationService.sendEmail(
          user.email,
          'Üretim Talebi Alındı',
          `Talebiniz oluşturuldu: ${detailLink}`,
          html
        );
      } catch (mailErr) {
        console.error('Mail gönderme hatası:', mailErr);
      }
      return res.status(201).json({
        message: 'Üretim talebi oluşturuldu',
        productionRequestId: newId
      });
    } catch (error) {
      console.error('ProductionRequestController.create Error:', error);
      return res.status(500).json({ message:error });
    }
  }

  /**
   * [Admin] Tüm üretim taleplerini listele
   */
  public static async getAll(req: Request, res: Response) {
    try {
         const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      if (userRole === 'customer') {
        const list = await ProductionRequestService.getRequestsByCustomer(userId);
        return res.json({ productionRequests: list });
      }

      if (userRole === 'manufacturer') {
        return res
          .status(403)
          .json({ message: 'Üretim taleplerini görüntüleme yetkiniz yok' });
      }

      const list = await ProductionRequestService.getAllRequests();
      return res.json({ productionRequests: list });
    } catch (error) {
      console.error('ProductionRequestController.getAll Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * [Müşteri] Kendi üretim taleplerini listele
   */
  public static async getMine(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const list = await ProductionRequestService.getRequestsByCustomer(userId);
      return res.json({ productionRequests: list });
    } catch (error) {
      console.error('ProductionRequestController.getMine Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Tek bir üretim talebi detayı
   */
  public static async getById(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const record = await ProductionRequestService.getRequestById(requestId);
      if (!record) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu talebe erişiminiz yok' });
      }

      return res.json({ productionRequest: record });
    } catch (error) {
      console.error('ProductionRequestController.getById Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Talep güncelleme
   */
  public static async update(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const existing = await ProductionRequestService.getRequestById(requestId);
      if (!existing) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      // Müşteri ise kendi kaydı ve status = 'pending' olmalı
      if (userRole === 'customer') {
        if (existing.customer_id !== userId) {
          return res.status(403).json({ message: 'Bu talebe erişiminiz yok' });
        }
        if (existing.status !== 'pending') {
          return res
            .status(400)
            .json({ message: 'Onaylanmış veya reddedilmiş talebi güncelleyemezsiniz' });
        }
      }

      const {
        productName,
        description,
        shippingType,
        quantity,
        currency
      } = req.body;

      await ProductionRequestService.updateRequest(
        requestId,
        productName,
        description || '',
        shippingType,
        quantity,
        currency
      );

      return res.json({ message: 'Üretim talebi güncellendi', requestId });
    } catch (error) {
      console.error('ProductionRequestController.update Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Talebi silme
   */
  public static async delete(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const existing = await ProductionRequestService.getRequestById(requestId);
      if (!existing) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      if (userRole === 'customer') {
        if (existing.customer_id !== userId) {
          return res.status(403).json({ message: 'Kendi talebiniz değil' });
        }
        if (existing.status !== 'pending') {
          return res
            .status(400)
            .json({ message: 'Onaylanan veya reddedilen kaydı silemezsiniz' });
        }
      }

      await ProductionRequestService.deleteRequest(requestId);
      return res.json({ message: 'Üretim talebi silindi', requestId });
    } catch (error) {
      console.error('ProductionRequestController.delete Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Admin - Talebi onayla
   */
  public static async approve(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const existing = await ProductionRequestService.getRequestById(requestId);
      if (!existing) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }

      if (existing.status !== 'pending') {
        return res
          .status(400)
          .json({ message: `Bu talep '${existing.status}' durumunda. Onaylanamaz.` });
      }

      await ProductionRequestService.approveRequest(requestId);

      // Opsiyonel bildirim
      // NotificationService.sendEmail(...)

      return res.json({ message: 'Üretim talebi onaylandı', requestId });
    } catch (error) {
      console.error('ProductionRequestController.approve Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Admin - Talebi reddet
   */
  public static async reject(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const existing = await ProductionRequestService.getRequestById(requestId);
      if (!existing) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }

      if (existing.status !== 'pending') {
        return res
          .status(400)
          .json({ message: `Bu talep '${existing.status}' durumunda. Reddedilemez.` });
      }

      await ProductionRequestService.rejectRequest(requestId);

      // Opsiyonel bildirim
      // NotificationService.sendEmail(...)

      return res.json({ message: 'Üretim talebi reddedildi', requestId });
    } catch (error) {
      console.error('ProductionRequestController.reject Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Super admin - Talebi reddet
   */
  public static async superReject(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      const existing = await ProductionRequestService.getRequestById(requestId);
      if (!existing) {
        return res.status(404).json({ message: 'Üretim talebi bulunamadı' });
      }

      const userRole = (req as any).userRole;
      if (userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Bu işlemi sadece super admin yapabilir' });
      }

      if (existing.status !== 'pending') {
        return res
          .status(400)
          .json({ message: `Bu talep '${existing.status}' durumunda. Reddedilemez.` });
      }

      await ProductionRequestService.rejectRequest(requestId);

      return res.json({ message: 'Üretim talebi reddedildi', requestId });
    } catch (error) {
      console.error('ProductionRequestController.superReject Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  public static async startProduction(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.id, 10);
      // DB update: productionStatus = 'inProduction'
      await pool.query(`UPDATE production_requests SET productionStatus = 'inProduction' WHERE id = ?`, [requestId]);
      return res.json({ message: 'Üretim süreci başlatıldı', requestId });
    } catch (err) {
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default ProductionRequestController;
