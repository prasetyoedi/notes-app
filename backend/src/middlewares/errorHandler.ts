import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message, err.stack);

  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal server';

  res.status(status).json({
    status: 'Error',
    message: message
  });
}