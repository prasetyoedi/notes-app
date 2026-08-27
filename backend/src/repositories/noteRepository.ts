import pool from '../config/database';

export interface Note {
  id: number;
  title: string;
  content: string | null;
  user_id: number;
  is_archived: boolean;
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NoteWithTags extends Omit<Note, 'user_id'> {
  tags: { id: number; name: string }[];
}

export async function createNote(title: string, content: string | null, userId: number): Promise<Note> {
  const query = `
    INSERT INTO notes (title, content, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, title, content, user_id, is_archived, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [title, content, userId]);
  return rows[0];
}

interface FindAllParams {
  userId: number;
  limit: number;
  offset: number;
  search?: string;
  tagIds?: number[];
  startDate?: string | null;
  endDate?: string | null;
  archived?: boolean; 
}

export async function findAllNotesWithPagination(params: FindAllParams): Promise<NoteWithTags[]> {
  const {
    userId,
    limit,
    offset,
    search = '',
    tagIds = [],
    startDate,
    endDate,
    archived = false,
  } = params;

  let baseQuery = `
    SELECT
      n.id,
      n.title,
      n.content,
      n.created_at,
      n.updated_at,
      n.is_archived,
      n.is_pinned,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', t.id, 'name', t.name)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM notes n
    LEFT JOIN notes_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE n.user_id = $1
    AND n.is_archived = $2
  `;

  const values: any[] = [userId, archived];
  let paramIndex = 3;

  if (search) {
    baseQuery += ` AND (n.title ILIKE $${paramIndex} OR n.content ILIKE $${paramIndex})`;
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (tagIds.length > 0) {
    const placeholders = tagIds.map((_, i) => `$${paramIndex + i}`).join(',');
    baseQuery += ` AND n.id IN (
      SELECT note_id FROM notes_tags WHERE tag_id IN (${placeholders})
    )`;
    values.push(...tagIds);
    paramIndex += tagIds.length;
  }

  if (startDate) {
    baseQuery += ` AND n.created_at >= $${paramIndex}`;
    values.push(startDate);
    paramIndex++;
  }
  if (endDate) {
    baseQuery += ` AND n.created_at <= $${paramIndex}`;
    values.push(endDate);
    paramIndex++;
  }

  baseQuery += `
    GROUP BY n.id
    ORDER BY n.is_pinned DESC, n.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  values.push(limit, offset);

  const { rows } = await pool.query(baseQuery, values);
  return rows;
}

export async function findNoteByIdAndUserId(id: number, userId: number): Promise<NoteWithTags | null> {
  const query = `
    SELECT
      n.id,
      n.title,
      n.content,
      n.created_at,
      n.updated_at,
      n.is_archived,
      n.is_pinned,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('id', t.id, 'name', t.name)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM notes n
    LEFT JOIN notes_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE n.id = $1 AND n.user_id = $2
    GROUP BY n.id
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function updateNoteById(id: number, userId: number, title: string, content: string | null): Promise<Note | null> {
  const query = `
    UPDATE notes
    SET title = $1, content = $2, updated_at = NOW()
    WHERE id = $3 AND user_id = $4
    RETURNING id, title, content, user_id, is_archived, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [title, content, id, userId]);
  return rows[0] || null;
}

export async function deleteNoteById(id: number, userId: number): Promise<{ id: number } | null> {
  const query = `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function archiveNoteById(id: number, userId: number): Promise<Note | null> {
  const query = `
    UPDATE notes
    SET is_archived = true, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, content, user_id, is_archived, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function unarchiveNoteById(id: number, userId: number): Promise<Note | null> {
  const query = `
    UPDATE notes
    SET is_archived = false, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, content, user_id, is_archived, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function pinNoteById(id: number, userId: number): Promise<Note | null> {
  const query = `
    UPDATE notes
    SET is_pinned = true, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, content, user_id, is_archived, is_pinned, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}

export async function unpinNoteById(id: number, userId: number): Promise<Note | null> {
  const query = `
    UPDATE notes
    SET is_pinned = false, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, title, content, user_id, is_archived, is_pinned, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] || null;
}