import { Router } from 'express';
import ProfileController from '../controllers/ProfileController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../utils/multerConfig';

const router = Router();

router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  Promise.resolve(ProfileController.uploadImage(req, res));
});

router.delete('/image', authMiddleware, (req, res) => {
  Promise.resolve(ProfileController.deleteImage(req, res));
});

export default router;
