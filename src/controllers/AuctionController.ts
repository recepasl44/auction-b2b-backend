// F:\b2b-auction-backend\src\controllers\AuctionController.ts
import { Request, Response } from 'express';
import pool from '../db';
import eventBus from '../events/EventBus'; // eventBus import
import AuctionService from '../services/AuctionService';
import CurrencyConversionService from '../services/CurrencyConversionService';
import AuctionInviteService from '../services/AuctionInviteService';
import ProductService from '../services/ProductService';
import { fileUrl } from '../utils/url';
import BidService from '../services/BidService';

/**
 * Bu controller hem direkt DB sorgularını içeriyor hem de AuctionService'i kısmen kullanıyor.
 * Dilerseniz createAuction, getAllAuctions vb. de AuctionService'e devredebilirsiniz.
 */
class AuctionController {
  /**
   * Tüm açık artırmaları listeleme
   */
  public static async getAllAuctions(req: Request, res: Response) {
    try {
const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      let baseQuery = `
        SELECT DISTINCT a.*, pr.product_id, pr.product_name, pr.customer_id,
               u.name AS customerName, u.email AS customerEmail
        FROM auctions a
        LEFT JOIN production_requests pr ON a.productionId = pr.id
        LEFT JOIN users u ON pr.customer_id = u.id
     `;
      let params: any[] = [];

      if (userRole === 'customer') {
        baseQuery += ' WHERE pr.customer_id = ?';
        params.push(userId);
      } else if (userRole === 'manufacturer') {
        baseQuery +=
          ' JOIN auction_invites ai ON ai.auctionId = a.id WHERE ai.manufacturerId = ?';
        params.push(userId);
      }

      const [rows] = await pool.query(baseQuery, params);
      const auctions = rows as any[];
      for (const auc of auctions) {
   const invites = await AuctionInviteService.getInvitesForAuction(auc.id);
        auc.invites = invites;
        auc.invited_supplier = invites.map((i: any) => i.manufacturerId);
        if (userRole === 'manufacturer') {
          const myInvite = invites.find((i: any) => i.manufacturerId === userId);
          if (myInvite) {
            auc.your_nickname = myInvite.nickname;
            auc.is_invited = 1;
            auc.invite_status = myInvite.inviteStatus;
          } else {
            auc.is_invited = 0;
          }
        } else {
          auc.is_invited = 0;
        }

        if (userRole !== 'admin') {
          delete auc.customerName;
          delete auc.customerEmail;
          delete auc.invited_supplier;
          auc.invites = invites.map((inv: any) => ({
            inviteId: inv.inviteId,
            inviteStatus: inv.inviteStatus,
            nickname: inv.nickname,
          }));

        if (auc.startPrice === 1 && auc.endPrice === 1 && auc.incrementStep === 1) {
          delete auc.startPrice;
          delete auc.endPrice;
          delete auc.incrementStep;
        }
        }      }
      return res.json({ auctions });
    } catch (error) {
      console.error('getAllAuctions Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Tek açık artırma detayı
   */
  public static async getAuctionById(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);
   const userId = (req as any).userId;
      const userRole = (req as any).userRole;
      const [rows] = await pool.query(
        `SELECT a.*, pr.product_id, pr.product_name, pr.customer_id,
                u.name AS customerName, u.email AS customerEmail
         FROM auctions a
         LEFT JOIN production_requests pr ON a.productionId = pr.id
         LEFT JOIN users u ON pr.customer_id = u.id
         WHERE a.id = ?`,
        [auctionId]
        );
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }
      const auction = (rows as any[])[0];

     
      if (userRole === 'manufacturer') {
        const [inviteRows] = await pool.query(
          `SELECT id, nickname, inviteStatus FROM auction_invites WHERE auctionId = ? AND manufacturerId = ?`,
          [auctionId, userId]
        );
        if (!(inviteRows as any[]).length) {
          return res
            .status(404)
            .json({ message: 'Böyle bir açık artırma yok ya da davet edilmediniz' });
        }
            const inviteData = (inviteRows as any[])[0];
        auction.your_nickname = inviteData.nickname;
        auction.is_invited = 1;
        auction.invite_status = inviteData.inviteStatus;
      } else {
        auction.is_invited = 0;
      }

      // Product details
      if (auction.product_id) {
        const product = await ProductService.getById(auction.product_id);
        if (product) {
          product.images = (product.images || []).map((img: string) =>
            fileUrl(req.protocol, req.get('host') || '', img)
          );
          auction.product = product;        }
      }
      if (auction.product_id) {
        const product = await ProductService.getById(auction.product_id);
        if (product) {
          product.images = (product.images || []).map((img: string) =>
            fileUrl(req.protocol, req.get('host') || '', img)
          );
          auction.product = product;
        }
      }

      const invites = await AuctionInviteService.getInvitesForAuction(auctionId);
      auction.invites = invites;
    const [lastRows] = await pool.query(
        `SELECT amount, userCurrency FROM bids WHERE auctionId = ? ORDER BY created_at DESC LIMIT 1`,
        [auctionId]
      );
      if ((lastRows as any[]).length) {
        const l = (lastRows as any[])[0];
        auction.lastOffer = `${l.amount}${l.userCurrency}`;
      } else {
        auction.lastOffer = null;
      }

      if (userRole !== 'admin') {
        delete auction.customerName;
        delete auction.customerEmail;
        delete auction.invited_supplier;
        auction.invites = invites.map((inv: any) => ({
          inviteId: inv.inviteId,
          inviteStatus: inv.inviteStatus,
          nickname: inv.nickname,
        }));
      }

      if (auction.startPrice === 1 && auction.endPrice === 1 && auction.incrementStep === 1) {
        delete auction.startPrice;
        delete auction.endPrice;
        delete auction.incrementStep;
      }
      return res.json({ auction });
    } catch (error) {
      return res.status(500).json({ message: error});
    }
  }

  /**
   * Yeni açık artırma oluşturma
   */
  // AuctionController.ts
  // F:\b2b-auction-backend\src\controllers\AuctionController.ts
  public static async createAuction(req: Request, res: Response) {
    try {
      const {
        title,
        startTime,
        endTime,
        startPrice,
        endPrice,
        incrementStep,
        baseCurrency,
        productionId: prodId,
        sortDirection,
        supplierIds
      } = req.body;
 const productionId = parseInt(prodId ?? req.body.production_id, 10);
       if (Number.isNaN(productionId)) {
        return res.status(400).json({ message: 'productionId gerekli' });
      }
      if(supplierIds && !Array.isArray(supplierIds)) {
        return res.status(400).json({ message: 'supplierIds bir dizi olmalı' });
      }
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      if (userRole === 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }

      if (userRole === 'customer') {
        const [prRows] = await pool.query(
          'SELECT customer_id FROM production_requests WHERE id = ?',
          [productionId]
        );
        if (!(prRows as any[]).length || (prRows as any[])[0].customer_id !== userId) {
          return res.status(403).json({ message: 'Bu üretim talebi size ait değil' });
        }
      }
      const safeStartPrice = startPrice ?? 0;
      const safeIncrementStep = incrementStep ?? 1;
      const safeBaseCurrency = baseCurrency ?? 'USD';
      const safeSortDirection = (sortDirection || 'asc').toLowerCase();

      const insertSql = `
      INSERT INTO auctions
     (title, startTime, endTime, startPrice, endPrice, incrementStep, baseCurrency, sortDirection, productionId, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned')
    `;
      const [result] = await pool.query(insertSql, [
        title,
        startTime,
        endTime,
        safeStartPrice,
        endPrice,
        safeIncrementStep,
        safeBaseCurrency,
        safeSortDirection,
        productionId
      ]);

      const newId = (result as any).insertId;
         if (Array.isArray(supplierIds) && supplierIds.length > 0) {
        await AuctionInviteService.inviteManufacturers(newId, supplierIds);
      }
      return res.status(201).json({ message: 'Açık artırma oluşturuldu', auctionId: newId });
    } catch (error) {
      console.error('createAuction Error:', error);
      return res.status(500).json({ message:error });
    }
  }



  /**
   * Açık artırma güncelleme
   */
  public static async updateAuction(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);
      const { title, startTime, endTime, startPrice, status } = req.body;

  const [existingRows] = await pool.query(
        `SELECT a.id, pr.customer_id FROM auctions a LEFT JOIN production_requests pr ON a.productionId = pr.id WHERE a.id = ?`,
        [auctionId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }
    const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      const record = (existingRows as any[])[0];
      if (userRole === 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }
      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu ihaleyi güncelleyemezsiniz' });
      }
      const updateSql = `
        UPDATE auctions
        SET title = ?, startTime = ?, endTime = ?, startPrice = ?, status = ?
        WHERE id = ?
      `;
      await pool.query(updateSql, [title, startTime, endTime, startPrice, status, auctionId]);

      return res.json({ message: 'Açık artırma güncellendi', auctionId });
    } catch (error) {
      console.error('updateAuction Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Açık artırma silme
   */
  public static async deleteAuction(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);
 const [existingRows] = await pool.query(
        `SELECT a.id, pr.customer_id FROM auctions a LEFT JOIN production_requests pr ON a.productionId = pr.id WHERE a.id = ?`,
        [auctionId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }

      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      const record = (existingRows as any[])[0];
      if (userRole === 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }
      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu ihaleyi silemezsiniz' });
      }

      const deleteSql = `DELETE FROM auctions WHERE id = ?`;
      await pool.query(deleteSql, [auctionId]);

      return res.json({ message: 'Açık artırma silindi', auctionId });
    } catch (error) {
      console.error('deleteAuction Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Teklif listeleme (örnek)
   */
  public static async getBidsForAuction(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);
      const sql = `SELECT * FROM bids WHERE auctionId = ?`;
      const [rows] = await pool.query(sql, [auctionId]);
      return res.json({ bids: rows });
    } catch (error) {
      console.error('getBidsForAuction Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
public static async getPlaceBidHistory(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.auctionId, 10);
      const bids = await BidService.getBidHistory(auctionId);
      return res.json({ auction: bids });
    } catch (error) {
      console.error('getPlaceBidHistory Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
   }
  /**
   * Teklif verme (NewBidPlaced event)
   */
  // AuctionController.ts
  public static async placeBid(req: Request, res: Response) {
    try {
      const { auctionId, userId, amount, userCurrency } = req.body;
      // userCurrency -> 'EUR', 'TRY', 'USD' vb.
      const [invRows] = await pool.query(`
      SELECT inviteStatus, nickname
      FROM auction_invites
      WHERE auctionId = ?
        AND manufacturerId = ?
    `, [auctionId, userId]);

      if (!(invRows as any[]).length) {
        return res.status(403).json({ message: 'Bu ihaleye davetli değilsiniz', userId });
      }
      const inviteData = (invRows as any[])[0];
      const inviteStatus = inviteData.inviteStatus;
      const nickname = inviteData.nickname;      if (inviteStatus !== 'accepted') {
        return res.status(403).json({ message: 'Davetiniz kabul edilmemiş. Teklif veremezsiniz.' });
      }
      const [auctionRows] = await pool.query(`SELECT * FROM auctions WHERE id = ?`, [auctionId]);
      if (!(auctionRows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }
      const auction = (auctionRows as any[])[0];
      const baseCurrency = auction.baseCurrency; // 'USD' gibi

      // Miktarı baseCurrency'ye dönüştür
      const amountInBase = await CurrencyConversionService.convertAmount(amount, userCurrency, baseCurrency);

      const sortDirection = (auction.sortDirection || 'asc').toLowerCase();
      const isFree =
        auction.startPrice === 1 &&
        auction.endPrice === 1 &&
        auction.incrementStep === 1;

      if (sortDirection === 'desc') {
        const [bidRows] = await pool.query(
          `SELECT MIN(amountInBase) as currentMin FROM bids WHERE auctionId = ?`,
          [auctionId]
        );
        let currentMin = (bidRows as any[])[0].currentMin;
        if (!isFree) {
          currentMin = currentMin ?? auction.startPrice;
          if (amountInBase > currentMin - auction.incrementStep) {
            return res.status(400).json({
              message: `Maksimum teklif: ${currentMin - auction.incrementStep} ${baseCurrency}`
            });
          }
          if (auction.endPrice && amountInBase < auction.endPrice) {
            return res.status(400).json({
              message: 'Bitiş fiyatının altına inemezsiniz.'
            });
          }
        }
      } else {
        const [bidRows] = await pool.query(
          `SELECT MAX(amountInBase) as currentMax FROM bids WHERE auctionId = ?`,
          [auctionId]
        );
        let currentMax = (bidRows as any[])[0].currentMax;
        if (!isFree) {
          currentMax = currentMax ?? auction.startPrice;
          if (amountInBase < currentMax + auction.incrementStep) {
            return res.status(400).json({
              message: `Minimum teklif: ${currentMax + auction.incrementStep} ${baseCurrency}`
            });
          }
          if (auction.endPrice && amountInBase > auction.endPrice) {
            return res.status(400).json({ message: 'Bitiş fiyatını geçemezsiniz.' });
          }
        }
      }

      // Teklif kaydet
      const sql = `
      INSERT INTO bids (auctionId, userId, amount, userCurrency, amountInBase)
      VALUES (?, ?, ?, ?, ?)
    `;
      const [result] = await pool.query(sql, [auctionId, userId, amount, userCurrency, amountInBase]);

      const bidId = (result as any).insertId;
      let bidTime = new Date().toISOString();
      try {
        const [timeRows] = await pool.query(
          'SELECT created_at FROM bids WHERE id = ?',
          [bidId]
        );
        if ((timeRows as any[]).length) {
          const created = (timeRows as any[])[0].created_at;
          bidTime = created instanceof Date ? created.toISOString() : String(created);
        }
      } catch (e) {
        // if query fails, keep default ISO string
      }

      const price = `${amount}${userCurrency}`;

      let createdAt = new Date().toISOString();
      if (bidId) {
        const [dateRows] = await pool.query(`SELECT created_at FROM bids WHERE id = ?`, [bidId]);
        if ((dateRows as any[]).length) {
          createdAt = (dateRows as any[])[0].created_at;
        }
      }
      // emit event
      eventBus.emit('NewBidPlaced', {
        auctionId,
        userId,
        amount,
        nickname,
        price,
        date: bidTime
      });

      return res.json({
        message: 'Teklif başarıyla verildi',
        nickname,
        price,
        date: bidTime
      });
    } catch (err: any) {
      // 1) Log full error to your console
      console.error('placeBid Error:', err);

      // 2) Send back the actual message (and stack in dev)
      const payload: any = { message:err };
      if (process.env.NODE_ENV !== 'production') {
        // expose more details in non‑prod
        payload.error = err.message;
        payload.stack = err.stack;
      }

      return res.status(500).json(payload);
    }
  }


  public static async startAuction(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);
      // DB update: status = 'active'
 const [existingRows] = await pool.query(
        `SELECT a.id, pr.customer_id FROM auctions a LEFT JOIN production_requests pr ON a.productionId = pr.id WHERE a.id = ?`,
        [auctionId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }
          const userRole = (req as any).userRole;
      const userId = (req as any).userId;
      const record = (existingRows as any[])[0];

      if (userRole === 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }
      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu ihaleyi başlatamazsınız' });
      }
      await pool.query(`UPDATE auctions SET status = 'active' WHERE id = ?`, [auctionId]);

      // Event emit
      eventBus.emit('AuctionStarted', { auctionId });

      return res.json({
        message: 'Açık artırma başlatıldı',
        auctionId
      });
    } catch (error) {
      console.error('startAuction Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Açık artırmayı bitirme (AuctionEnded event)
   */
  // AuctionController.ts
  public static async endAuction(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.id, 10);

      // Auction var mı?
 const [existingRows] = await pool.query(
        `SELECT a.id, pr.customer_id FROM auctions a LEFT JOIN production_requests pr ON a.productionId = pr.id WHERE a.id = ?`,
        [auctionId]
      );      if (!(existingRows as any[]).length) {
        return res.status(404).json({ message: 'Açık artırma bulunamadı' });
      }
 const userRole = (req as any).userRole;
      const userId = (req as any).userId;
      const record = (existingRows as any[])[0];

      if (userRole === 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }
      if (userRole === 'customer' && record.customer_id !== userId) {
        return res.status(403).json({ message: 'Bu ihaleyi sonlandıramazsınız' });
      }
      // Kazanan kim?
      const [bidRows] = await pool.query(`
      SELECT userId
      FROM bids
      WHERE auctionId = ?
      ORDER BY amount DESC
      LIMIT 1
    `, [auctionId]);
      const winner = (bidRows as any[]).length ? (bidRows as any[])[0].userId : null;

      // status = 'ended'
      await pool.query(`UPDATE auctions SET status = 'ended' WHERE id = ?`, [auctionId]);

      // Event
      eventBus.emit('AuctionEnded', { auctionId, winnerId: winner });

      return res.json({
        message: 'Açık artırma sonlandırıldı',
        auctionId,
        winner
      });
    } catch (error) {
      console.error('endAuction Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }


}

export default AuctionController;
