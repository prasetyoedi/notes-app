import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function register(email: string, password: string) {
  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    const err = new Error('Email sudah terdaftar');
    (err as any).status = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await userRepository.createUser(email, passwordHash);
  return user;
}

export async function login(email: string, password: string) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    const err = new Error('Email atau password salah');
    (err as any).status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Email atau password salah');
    (err as any).status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, email: user.email } };
}

export async function logout() {
  return { message: 'Logout berhasil' };
}