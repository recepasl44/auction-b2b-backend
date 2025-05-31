// F:\b2b-auction-backend\src\routes\auctionRoutes.ts
import { Router } from 'express';
import AuctionController from '../controllers/AuctionController';
import AuctionInviteController from '../controllers/AuctionInviteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const auctionRouter = Router();

/**
 * AuctionController ile ilgili rotalar
 */
auctionRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.getAllAuctions(req, res));
});
auctionRouter.get('/placeBid/:auctionId', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.getPlaceBidHistory(req, res));
});
auctionRouter.put('/invites', authMiddleware, (req, res) => {
  Promise.resolve(AuctionInviteController.updateInvite(req, res));
});
auctionRouter.get('/:id', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.getAuctionById(req, res));
});

auctionRouter.post('/', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.createAuction(req, res));
});

auctionRouter.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.updateAuction(req, res));
});

auctionRouter.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.deleteAuction(req, res));
});

// Teklifler
auctionRouter.get('/:id/bids', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.getBidsForAuction(req, res));
});

auctionRouter.post('/placeBid', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.placeBid(req, res));
});

// Açık artırma başlat/bitir
auctionRouter.post('/:id/start', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.startAuction(req, res));
});

auctionRouter.post('/:id/end', authMiddleware, (req, res) => {
  Promise.resolve(AuctionController.endAuction(req, res));
});

/**
 * AuctionInviteController ile ilgili rotalar
 */
auctionRouter.post('/:auctionId/invite', authMiddleware, (req, res) => {
  Promise.resolve(AuctionInviteController.invite(req, res));
});

auctionRouter.get('/myInvites', authMiddleware, (req, res) => {
  Promise.resolve(AuctionInviteController.getMyInvites(req, res));
});

auctionRouter.post('/respondInvite', authMiddleware, (req, res) => {
  Promise.resolve(AuctionInviteController.respond(req, res));
});

export default auctionRouter;
