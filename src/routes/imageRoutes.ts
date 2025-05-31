// F:\b2b-auction-backend\src\routes\imageRoutes.ts
import { Router } from 'express';
import { upload } from '../utils/multerConfig';
import pool from '../db';
import { authMiddleware } from '../middlewares/authMiddleware';
import { fileUrl } from '../utils/url';

const router = Router();

// Örnek: POST /api/images/productionRequest/:id
router.post('/productionRequest/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const prId = parseInt(req.params.id, 10);
    if (!req.file) {
      return res.status(400).json({ message: 'Görsel bulunamadı.' });
    }

    // DB kaydı
    const insertSql = `
      INSERT INTO product_images (productionRequestId, imagePath)
      VALUES (?, ?)
    `;
    await pool.query(insertSql, [prId, req.file.path]);

      const url = fileUrl(req.protocol, req.get('host') || '', req.file.path);

    return res.json({ message: 'Resim yüklendi', path: url });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});
router.post('/product/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (!req.file) {
      return res.status(400).json({ message: 'Görsel bulunamadı.' });
    }

    const insertSql = `
      INSERT INTO product_images (productId, imagePath)
      VALUES (?, ?)
    `;
    await pool.query(insertSql, [productId, req.file.path]);

      const url = fileUrl(req.protocol, req.get('host') || '', req.file.path);

    return res.json({ message: 'Resim yüklendi', path: url });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni: GET /api/images/product/:id
router.get('/product/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const sql = 'SELECT imagePath FROM product_images WHERE productId = ? ORDER BY id';
    const [rows] = await pool.query(sql, [productId]);
    const images = (rows as any[]).map(r => r.imagePath);
    return res.json({ images });
  } catch (error) {
    console.error('Image list error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});
// Örnek: POST /api/images/auction/:id
router.post('/auction/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id, 10);
    if (!req.file) {
      return res.status(400).json({ message: 'Görsel bulunamadı.' });
    }

    // DB kaydı
    const insertSql = `
      INSERT INTO product_images (auctionId, imagePath)
      VALUES (?, ?)
    `;
    await pool.query(insertSql, [auctionId, req.file.path]);

   const url = fileUrl(req.protocol, req.get('host') || '', req.file.path);

    return res.json({ message: 'Resim yüklendi', path: url });
    } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router;
