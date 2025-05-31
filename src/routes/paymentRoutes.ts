// F:\b2b-auction-backend\src\routes\paymentRoutes.ts
import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';

const paymentRouter = Router();

/**
 * Örnek: Sadece giriş yapmış kullanıcı görebilsin.
 * Bazı durumlarda admin vs. kısıtlaması da eklenebilir.
 */
paymentRouter.get('/', authMiddleware, (req, res) => {
  Promise.resolve(PaymentController.getAllPaymentSchedules(req, res));
});

paymentRouter.get('/order/:orderId', authMiddleware, (req, res) => {
  Promise.resolve(PaymentController.getPaymentSchedulesByOrder(req, res));
});

paymentRouter.post('/', authMiddleware, (req, res) => {
  Promise.resolve(PaymentController.createPaymentSchedule(req, res));
});

paymentRouter.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(PaymentController.updatePaymentSchedule(req, res));
});

paymentRouter.delete('/:id', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(PaymentController.deletePaymentSchedule(req, res));
});

// Ödeme alındı olarak işaretleme
paymentRouter.post('/:id/markPaid', authMiddleware, (req, res) => {
  Promise.resolve(PaymentController.markPaymentAsPaid(req, res));
});

export default paymentRouter;
