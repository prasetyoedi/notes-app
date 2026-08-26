import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'Error',
      message: 'Token tidak ditemukan atau format tidak valid'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'Error',
      message: 'Token tidak valid atau sudah kadaluwarsa'
    });
  }
}