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
      const { inviteId, action } = req.body;
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      // Sadece üreticiler bu işlemi yapabilir
      if (userRole !== 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi sadece üreticiler yapabilir' });
      }

      // Kontrol: inviteId gerçekten bu userId'ye mi ait?
      const invite = await AuctionInviteService.getInviteById(inviteId);
      if (!invite) {
        return res.status(404).json({ message: 'Davet kaydı bulunamadı' });
      }
    

      if (action !== 'accepted' && action !== 'declined') {
        return res.status(400).json({ message: 'Geçersiz action parametresi' });
      }

      await AuctionInviteService.respondToInvite(inviteId, action as 'accepted' | 'declined');
      return res.json({ message: `Davet ${action} olarak işaretlendi`, inviteId });
    } catch (error) {
      console.error('AuctionInviteController.respond Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Daveti kabul etmek için kısayol endpointi
   * POST /api/auctions/invites/:inviteId/accept
   */
  public static async accept(req: Request, res: Response) {
    try {
      const inviteId = parseInt(req.params.inviteId, 10);
      const userRole = (req as any).userRole;
      const userId = (req as any).userId;

      if (userRole !== 'manufacturer') {
        return res.status(403).json({ message: 'Bu işlemi sadece üreticiler yapabilir' });
      }

      const invite = await AuctionInviteService.getInviteById(inviteId);
      if (!invite) {
        return res.status(404).json({ message: 'Davet kaydı bulunamadı' });
      }
      if (invite.manufacturerId !== userId) {
        return res.status(403).json({ message: 'Bu davet size ait değil' });
      }

      await AuctionInviteService.respondToInvite(inviteId, 'accepted');
      return res.json({ message: 'Davet kabul edildi', inviteId });
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
