// F:\b2b-auction-backend\src\routes\settingRoutes.ts
import { Router } from 'express';
import SettingController from '../controllers/SettingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const settingRouter = Router();

// GET /api/settings
settingRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(SettingController.getAll(req, res));
});

// PUT /api/settings/:key
settingRouter.put('/:key', authMiddleware, (req, res) => {
  Promise.resolve(SettingController.update(req, res));
});

export default settingRouter;
