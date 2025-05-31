// F:\b2b-auction-backend\src\routes\orderRoutes.ts
import { Router } from 'express';
import OrderController from '../controllers/OrderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const orderRouter = Router();

// GET /api/orders
orderRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(OrderController.getAllOrders(req, res));
});

// GET /api/orders/:id
orderRouter.get('/:id', authMiddleware, (req, res) => {
  Promise.resolve(OrderController.getOrderById(req, res));
});

// POST /api/orders
orderRouter.post('/', authMiddleware, (req, res) => {
  Promise.resolve(OrderController.createOrder(req, res));
});

// PUT /api/orders/:id
orderRouter.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(OrderController.updateOrder(req, res));
});

// DELETE /api/orders/:id
orderRouter.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(OrderController.deleteOrder(req, res));
});

export default orderRouter;
