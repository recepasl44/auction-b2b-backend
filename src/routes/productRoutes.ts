import { Router } from 'express';
import ProductController from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../utils/multerConfig';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  Promise.resolve(ProductController.create(req, res));
});

router.get('/', authMiddleware, (req, res) => {
  Promise.resolve(ProductController.getAll(req, res));
});

router.get('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductController.getById(req, res));
});

router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  Promise.resolve(ProductController.update(req, res));
});

router.delete('/:id', authMiddleware, (req, res) => {
  Promise.resolve(ProductController.delete(req, res));
});

export default router;