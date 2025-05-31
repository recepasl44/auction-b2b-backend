// F:\b2b-auction-backend\src\routes\shipmentRoutes.ts
import { Router } from 'express';
import ShipmentController from '../controllers/ShipmentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const shipmentRouter = Router();

// GET /api/shipments
shipmentRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(ShipmentController.getAllShipments(req, res));
});

// GET /api/shipments/order/:orderId
shipmentRouter.get('/order/:orderId', authMiddleware, (req, res) => {
  Promise.resolve(ShipmentController.getShipmentsByOrder(req, res));
});

// POST /api/shipments
shipmentRouter.post('/', authMiddleware, (req, res) => {
  Promise.resolve(ShipmentController.createShipment(req, res));
});

// PUT /api/shipments/:id
shipmentRouter.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ShipmentController.updateShipment(req, res));
});

// DELETE /api/shipments/:id
shipmentRouter.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ShipmentController.deleteShipment(req, res));
});

export default shipmentRouter;
