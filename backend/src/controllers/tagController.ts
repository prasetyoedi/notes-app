import { Request, Response, NextFunction } from 'express';
import * as tagService from '../services/tagService';

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const userId = (req as any).user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'Error',
        message: 'Nama tag wajib diisi'
      });
    }

    const tag = await tagService.createTag(name.trim(), userId);
    res.status(201).json({
      status: 'Success',
      message: 'Tag berhasil dibuat',
      data: tag
    });
  } catch (error) {
    next(error);
  }
}

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const tags = await tagService.getTags(userId);
    res.status(200).json({
      status: 'Success',
      message: 'Tags berhasil diambil',
      data: tags
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const tagId = parseInt(id as string, 10);
    if (isNaN(tagId)) {
      return res.status(400).json({
        status: 'Error',
        message: 'ID tag tidak valid'
      });
    }

    await tagService.deleteTag(tagId, userId);
    res.status(200).json({
      status: 'Success',
      message: 'Tag berhasil dihapus',
      data: null
    });
  } catch (error) {
    next(error);
  }
}