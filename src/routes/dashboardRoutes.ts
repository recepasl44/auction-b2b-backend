import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const dashboardRouter = Router();

dashboardRouter.get('/overview', authMiddleware, (req, res) => {
  Promise.resolve(DashboardController.getOverview(req, res));
});

export default dashboardRouter;