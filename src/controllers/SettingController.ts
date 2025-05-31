// SettingController.ts
import { Request, Response } from 'express';
import SettingService from '../services/SettingService';

class SettingController {
  /**
   * Tüm ayarları listele
   */
  public static async getAll(req: Request, res: Response) {
    try {
      // Sadece admin veya superAdmin
      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Yetersiz yetki' });
      }

      const settings = await SettingService.getAll();
      return res.json({ settings });
    } catch (error) {
      console.error('SettingController.getAll Error:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Tek bir ayarı güncelle
   * Body: { value: string }
   */
  public static async update(req: Request, res: Response) {
    try {
      // 1) Yetki kontrolü
      const userRole = (req as any).userRole;
      if (userRole !== 'admin' && userRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Yetersiz yetki' });
      }

      // 2) URL parametreden anahtar
      const key = req.params.key;

      // 3) Body’de gerçekten value var mı?
      if (req.body == null || typeof req.body.value === 'undefined') {
        return res
          .status(400)
          .json({ message: 'Eksik veya hatalı istek: "value" zorunlu.' });
      }
      const value = req.body.value;

      // 4) Servise kayıt
      await SettingService.setValue(key, value);

      // 5) Başarıyla dön
      return res.json({ message: 'Ayar güncellendi', key, value });
    } catch (error) {
      console.error('SettingController.update Error:', error);
      return res.status(500).json({ message: error });
    }
  }
}

export default SettingController;
