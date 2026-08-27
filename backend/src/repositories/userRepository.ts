import pool from '../config/database';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(email: string, passwordHash: string): Promise<Omit<User, 'password_hash'>> {
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [email, passwordHash]);
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const query = `SELECT id, email, password_hash FROM users WHERE email = $1`;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
}

export async function findUserById(id: number): Promise<Omit<User, 'password_hash'> | null> {
  const query = `SELECT id, email, created_at, updated_at FROM users WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}