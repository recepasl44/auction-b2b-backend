import { Request, Response } from 'express';
import AuctionInviteService from '../services/AuctionInviteService';

class AuctionInviteController {
  /**
   * Admin -> Belirli bir ihaleye üreticileri davet et
   * Body: { manufacturerIds: number[] }
   */
  public static async invite(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.params.auctionId, 10);
      const { manufacturerIds } = req.body;

      // Role kontrol (admin veya superAdmin)
      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }

      await AuctionInviteService.inviteManufacturers(auctionId, manufacturerIds);
      return res.json({
        message: 'Üreticilere davet gönderildi',
        auctionId,
        manufacturerIds
      });
    } catch (error) {
      console.error('AuctionInviteController.invite Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Üreticinin (manufacturer) davet edildiği ihaleleri listele
   * GET /api/auctionInvites/myInvites
   */
  public static async getMyInvites(req: Request, res: Response) {
    try {
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      // Sadece üreticiler (manufacturer) görebilir
      if (userRole !== 'manufacturer') {
        return res.status(403).json({ message: 'Sadece üreticiler davetleri görebilir' });
      }

      const invites = await AuctionInviteService.getInvitesForManufacturer(userId);
      return res.json({ invites });
    } catch (error) {
      console.error('AuctionInviteController.getMyInvites Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Davete yanıt verme (accepted / declined)
   * POST /api/auctionInvites/respond
   * Body: { inviteId, action: 'accepted' or 'declined' }
   */
  public static async respond(req: Request, res: Response) {
    try {
      const auctionId = parseInt(req.body.inviteId, 10);
      const { action } = req.body;
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      // Sadece üreticiler bu işlemi yapabilir
      if (userRole !== 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi sadece üreticiler yapabilir' });
      }

      if (action !== 'accepted' && action !== 'declined') {
        return res.status(400).json({ message: 'Geçersiz action parametresi' });
      }

      // Gelen inviteId parametresi aslında auctionId'yi temsil ediyor
      const invite = await AuctionInviteService.getInviteByAuctionAndManufacturer(
        auctionId,
        userId
      );
      if (!invite) {
        return res.status(404).json({ message: 'Davet kaydı bulunamadı' });
      }

      const updated = await AuctionInviteService.respondToInviteByAuction(
        auctionId,
        userId,
        action as 'accepted' | 'declined'
      );

      if (!updated) {
        return res.status(500).json({ message: 'Davet durumu güncellenemedi' });
      }
      return res.json({
        message: `Davet ${action} olarak işaretlendi`,
        inviteId: invite.id,
        auctionId: invite.auctionId
      });
    } catch (error) {
      console.error('AuctionInviteController.respond Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Daveti e-posta linki ile kabul et
   * GET /api/auctions/invites/:inviteId/accept
   */
  public static async accept(req: Request, res: Response) {
    try {
      const inviteId = parseInt(req.params.inviteId, 10);

      const updated = await AuctionInviteService.respondToInvite(inviteId, 'accepted');
      if (!updated) {
        return res.status(404).json({ message: 'Davet kaydı bulunamadı' });
      }

      const redirectUrl = `${process.env.FRONTEND_URL || 'https://panel.demaxtore.com'}/auctions/list`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('AuctionInviteController.accept Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
  
  /**
   * Davet durumunu güncelle (admin)
   * PUT /api/auctions/invites
   * Body: { user_id, auction_id, invite_status }
   */
  public static async updateInvite(req: Request, res: Response) {
    try {
      const { user_id, auction_id, invite_status } = req.body;

      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }

      await AuctionInviteService.updateInviteStatus(
        auction_id,
        user_id,
        invite_status
      );

      return res.json({ message: 'Davet durumu güncellendi' });
    } catch (error) {
      console.error('AuctionInviteController.updateInvite Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default AuctionInviteController;
