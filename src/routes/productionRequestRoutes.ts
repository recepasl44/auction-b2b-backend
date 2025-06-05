// F:\b2b-auction-backend\src\routes\productionRequestRoutes.ts
import { Router } from 'express';
import ProductionRequestController from '../controllers/ProductionRequestController';
import { authMiddleware } from '../middlewares/authMiddleware';

const productionRequestRouter = Router();

// POST /api/productionRequests
productionRequestRouter.post('/', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.create(req, res));
});

// GET /api/productionRequests
productionRequestRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.getAll(req, res));
});

// GET /api/productionRequests/mine
productionRequestRouter.get('/mine', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.getMine(req, res));
});

// GET /api/productionRequests/:id
productionRequestRouter.get('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.getById(req, res));
});

// PUT /api/productionRequests/:id
productionRequestRouter.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.update(req, res));
});

// DELETE /api/productionRequests/:id
productionRequestRouter.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.delete(req, res));
});

// PUT /api/productionRequests/:id/approve
productionRequestRouter.put('/:id/approve', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.approve(req, res));
});

// PUT /api/productionRequests/:id/reject
productionRequestRouter.put('/:id/reject', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.reject(req, res));
});

// PUT /api/productionRequests/:id/superReject
productionRequestRouter.put('/:id/superReject', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.superReject(req, res));
});

/**
 * Opsiyonel: Üretim sürecini başlatma (#18)
 */
// PUT /api/productionRequests/:id/startProduction
productionRequestRouter.put('/:id/startProduction', authMiddleware, (req, res) => {
  Promise.resolve(ProductionRequestController.startProduction(req, res));
});

export default productionRequestRouter;
