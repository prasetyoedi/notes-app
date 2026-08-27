import pool from '../config/database';

export interface Tag {
  id: number;
  name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export async function createTag(name: string, userId: number): Promise<Tag> {
  const query = `
    INSERT INTO tags (name, user_id)
    VALUES ($1, $2)
    RETURNING id, name, user_id, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [name, userId]);
  return rows[0];
}

export async function findAllTagsByUserId(userId: number): Promise<Omit<Tag, 'user_id'>[]> {
  const query = `
    SELECT id, name, created_at, updated_at
    FROM tags
    WHERE user_id = $1
    ORDER BY name ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}

export async function findTagByIdAndUserId(id: number, userId: number): Promise<Tag | null> {
  const query = `
    SELECT id, name, user_id, created_at, updated_at
    FROM tags
    WHERE id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function findTagByNameAndUserId(name: string, userId: number): Promise<{ id: number } | null> {
  const query = `SELECT id FROM tags WHERE name = $1 AND user_id = $2`;
  const { rows } = await pool.query(query, [name, userId]);
  return rows[0] || null;
}

export async function deleteTagById(id: number, userId: number): Promise<{ id: number } | null> {
  const query = `DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}