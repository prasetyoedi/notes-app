import pool from '../config/database';

export async function addTagsToNote(noteId: number, tagIds: number[]): Promise<{ note_id: number; tag_id: number }[]> {
  if (tagIds.length === 0) return [];
  const values = tagIds.map((tagId) => [noteId, tagId]).flat();
  const placeholders = tagIds.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');
  const query = `
    INSERT INTO notes_tags (note_id, tag_id)
    VALUES ${placeholders}
    ON CONFLICT (note_id, tag_id) DO NOTHING
    RETURNING note_id, tag_id
  `;
  const { rows } = await pool.query(query, values);
  return rows;
}

export async function removeTagsFromNote(noteId: number, tagIds: number[]): Promise<{ note_id: number; tag_id: number }[]> {
  if (tagIds.length === 0) return [];
  const placeholders = tagIds.map((_, i) => `$${i + 2}`).join(',');
  const query = `
    DELETE FROM notes_tags
    WHERE note_id = $1 AND tag_id IN (${placeholders})
    RETURNING note_id, tag_id
  `;
  const { rows } = await pool.query(query, [noteId, ...tagIds]);
  return rows;
}

export async function findTagIdsByNoteId(noteId: number): Promise<number[]> {
  const query = `SELECT tag_id FROM notes_tags WHERE note_id = $1`;
  const { rows } = await pool.query(query, [noteId]);
  return rows.map(row => row.tag_id);
}