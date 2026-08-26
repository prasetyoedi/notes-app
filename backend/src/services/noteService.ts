import * as noteRepository from '../repositories/noteRepository';
import * as tagRepository from '../repositories/tagRepository';
import * as notesTagsRepository from '../repositories/notesTagsRepository';

export async function createNote(
  { title, content, tagIds }: { title: string; content: string | null; tagIds?: number[] },
  userId: number
) {
  if (!title || title.trim() === '') {
    const err = new Error('Title note wajib diisi');
    (err as any).status = 400;
    throw err;
  }

  if (tagIds && tagIds.length > 0) {
    await Promise.all(
      tagIds.map(async (tagId) => {
        const tag = await tagRepository.findTagByIdAndUserId(tagId, userId);
        if (!tag) {
          const err = new Error(`Tag dengan id ${tagId} tidak valid atau bukan milik Anda`);
          (err as any).status = 400;
          throw err;
        }
        return tag;
      })
    );
  }

  const note = await noteRepository.createNote(title, content, userId);

  if (tagIds && tagIds.length > 0) {
    await notesTagsRepository.addTagsToNote(note.id, tagIds);
  }

  const fullNote = await noteRepository.findNoteByIdAndUserId(note.id, userId);
  return fullNote;
}

export async function getNotes(userId: number, queryParams: any) {
  const { limit = 10, page = 1, search = '', tags = [], startDate, endDate } = queryParams;
  const offset = (page - 1) * limit;

  let tagIds: number[] = [];
  if (tags) {
    if (Array.isArray(tags)) {
      tagIds = tags.map(id => parseInt(id)).filter(id => !isNaN(id));
    } else if (typeof tags === 'string') {
      tagIds = tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }
  }

  if (tagIds.length > 0) {
    await Promise.all(
      tagIds.map(async (tagId) => {
        const tag = await tagRepository.findTagByIdAndUserId(tagId, userId);
        if (!tag) {
          const err = new Error(`Tag dengan id ${tagId} tidak valid atau bukan milik Anda`);
          (err as any).status = 400;
          throw err;
        }
        return tag;
      })
    );
  }

  const notes = await noteRepository.findAllNotesWithPagination({
    userId,
    limit,
    offset,
    search,
    tagIds,
    startDate,
    endDate,
  });

  return notes;
}

export async function getNoteDetail(noteId: number, userId: number) {
  const note = await noteRepository.findNoteByIdAndUserId(noteId, userId);
  if (!note) {
    const err = new Error('Note tidak ditemukan atau bukan milik Anda');
    (err as any).status = 404;
    throw err;
  }
  return note;
}

export async function updateNote(
  noteId: number,
  userId: number,
  { title, content, tagIds }: { title: string; content: string | null; tagIds?: number[] }
) {
  if (!title || title.trim() === '') {
    const err = new Error('Title note wajib diisi');
    (err as any).status = 400;
    throw err;
  }

  const existing = await noteRepository.findNoteByIdAndUserId(noteId, userId);
  if (!existing) {
    const err = new Error('Note tidak ditemukan atau bukan milik Anda');
    (err as any).status = 404;
    throw err;
  }

  if (tagIds && tagIds.length > 0) {
    await Promise.all(
      tagIds.map(async (tagId) => {
        const tag = await tagRepository.findTagByIdAndUserId(tagId, userId);
        if (!tag) {
          const err = new Error(`Tag dengan id ${tagId} tidak valid atau bukan milik Anda`);
          (err as any).status = 400;
          throw err;
        }
        return tag;
      })
    );
  }

  const updated = await noteRepository.updateNoteById(noteId, userId, title, content);
  if (!updated) {
    const err = new Error('Gagal update note');
    (err as any).status = 500;
    throw err;
  }

  if (tagIds !== undefined) {
    const currentTagIds = await notesTagsRepository.findTagIdsByNoteId(noteId);
    if (currentTagIds.length > 0) {
      await notesTagsRepository.removeTagsFromNote(noteId, currentTagIds);
    }
    if (tagIds.length > 0) {
      await notesTagsRepository.addTagsToNote(noteId, tagIds);
    }
  }

  const fullNote = await noteRepository.findNoteByIdAndUserId(noteId, userId);
  return fullNote;
}

export async function deleteNote(noteId: number, userId: number) {
  const existing = await noteRepository.findNoteByIdAndUserId(noteId, userId);
  if (!existing) {
    const err = new Error('Note tidak ditemukan atau bukan milik Anda');
    (err as any).status = 404;
    throw err;
  }

  const deleted = await noteRepository.deleteNoteById(noteId, userId);
  if (!deleted) {
    const err = new Error('Gagal hapus note');
    (err as any).status = 500;
    throw err;
  }
  return { id: deleted.id };
}