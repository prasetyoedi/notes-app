import * as tagRepository from '../repositories/tagRepository';

export async function createTag(name: string, userId: number) {
  const existing = await tagRepository.findTagByNameAndUserId(name, userId);
  if (existing) {
    const err = new Error('Tag dengan nama tersebut sudah ada');
    (err as any).status = 400;
    throw err;
  }
  const tag = await tagRepository.createTag(name, userId);
  return tag;
}

export async function getTags(userId: number) {
  return await tagRepository.findAllTagsByUserId(userId);
}

export async function deleteTag(id: number, userId: number) {
  const deleted = await tagRepository.deleteTagById(id, userId);
  if (!deleted) {
    const err = new Error('Tag tidak ditemukan atau bukan milik Anda');
    (err as any).status = 404;
    throw err;
  }
  return { id: deleted.id };
}