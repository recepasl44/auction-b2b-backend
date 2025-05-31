import { Router } from 'express';
import ProductAttributeController from '../controllers/ProductAttributeController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/product/:productId', authMiddleware, (req, res) => {
  Promise.resolve(ProductAttributeController.list(req, res));
});

router.post('/product/:productId', authMiddleware, (req, res) => {
  Promise.resolve(ProductAttributeController.create(req, res));
});

router.put('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductAttributeController.update(req, res));
});

router.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductAttributeController.delete(req, res));
});

export default router;