
import { Router } from 'express';
import ReportController from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';

const reportRouter = Router();

reportRouter.get('/summary', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(ReportController.getSummary(req, res));
});

reportRouter.get('/dateRange', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(ReportController.getAuctionsAndOrdersByDateRange(req, res));
});

reportRouter.get('/topBidded', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(ReportController.getTopBiddedAuctions(req, res));
});

reportRouter.get('/whoWonAuctions', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(ReportController.getWhoWonAuctions(req, res));
});

export default reportRouter;
