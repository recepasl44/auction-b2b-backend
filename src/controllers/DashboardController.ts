import { Request, Response } from 'express';
import DashboardService from '../services/DashboardService';

class DashboardController {
  public static async getOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const userRole = (req as any).userRole;

      if (userRole === 'customer') {
        const data = await DashboardService.getCustomerOverview(userId);
        return res.json({ role: userRole, data });
      }

      if (userRole === 'manufacturer') {
        const data = await DashboardService.getManufacturerOverview(userId);
        return res.json({ role: userRole, data });
      }

      // admin / superAdmin
      const data = await DashboardService.getAdminOverview();
      return res.json({ role: userRole, data });
    } catch (err) {
      console.error('DashboardController.getOverview Error:', err);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}

export default DashboardController;