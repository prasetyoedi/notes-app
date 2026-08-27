import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/noteService';

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, tagIds } = req.body;
    const userId = (req as any).user.id;

    const note = await noteService.createNote({ title, content, tagIds }, userId);
    res.status(201).json({
      status: 'Success',
      message: 'Note berhasil dibuat',
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { limit, page, search, tags, startDate, endDate, isArchived } = req.query;

    const notes = await noteService.getNotes(userId, {
      limit: limit ? parseInt(limit as string, 10) : 10,
      page: page ? parseInt(page as string, 10) : 1,
      search: (search as string) || '',
      tags: tags || [],
      startDate: (startDate as string) || null,
      endDate: (endDate as string) || null,
      isArchived: (isArchived as string) || 'false',
    });

    res.status(200).json({
      status: 'Success',
      message: 'Notes berhasil diambil',
      data: notes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNoteDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const noteId = parseInt(id as string, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID note tidak valid',
      });
    }

    const note = await noteService.getNoteDetail(noteId, userId);
    res.status(200).json({
      status: 'Success',
      message: 'Note detail berhasil diambil',
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, content, tagIds } = req.body;
    const userId = (req as any).user.id;
    const noteId = parseInt(id as string, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID note tidak valid',
      });
    }

    const updated = await noteService.updateNote(noteId, userId, { title, content, tagIds });
    res.status(200).json({
      status: 'Success',
      message: 'Note berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const noteId = parseInt(id as string, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID note tidak valid',
      });
    }

    await noteService.deleteNote(noteId, userId);
    res.status(200).json({
      status: 'Success',
      message: 'Note berhasil dihapus',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const noteId = parseInt(id as string, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID note tidak valid',
      });
    }

    const archived = await noteService.archiveNote(noteId, userId);
    res.status(200).json({
      status: 'Success',
      message: 'Note berhasil diarsipkan',
      data: archived,
    });
  } catch (error) {
    next(error);
  }
}

export async function unarchiveNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const noteId = parseInt(id as string, 10);
    if (isNaN(noteId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID note tidak valid',
      });
    }

    const unarchived = await noteService.unarchiveNote(noteId, userId);
    res.status(200).json({
      status: 'Success',
      message: 'Note berhasil dikembalikan dari arsip',
      data: unarchived,
    });
  } catch (error) {
    next(error);
  }
}