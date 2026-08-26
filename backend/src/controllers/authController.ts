import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'Error',
        message: 'Email dan password wajib diisi'
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        status: 'Error',
        message: 'Password minimal 8 karakter'
      });
    }

    const user = await authService.register(email, password);
    res.status(201).json({
      status: 'Success',
      message: 'Registrasi berhasil',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'Error',
        message: 'Email dan password wajib diisi'
      });
    }

    const result = await authService.login(email, password);
    res.status(200).json({
      status: 'Success',
      message: 'Login berhasil',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.logout();
    res.status(200).json({
      status: 'Success',
      message: result.message,
      data: null
    });
  } catch (error) {
    next(error);
  }
}