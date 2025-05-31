import { Request, Response, NextFunction } from 'express';

/**
 * errorHandler:
 * - Controller veya diğer middleware'lerde throw edilen hataları yakalar.
 * - Kendi formatıyla JSON response döner.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);

  // İsteğe göre hatanın tipine göre farklı status kodları atayabilirsiniz
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası';

  return res.status(statusCode).json({ message });
};
