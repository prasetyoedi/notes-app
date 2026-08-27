import { Router } from 'express';
import * as tagController from '../controllers/tagController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Buat tag baru
 *     tags: [Tags]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag berhasil dibuat
 */
router.post('/', authenticate, tagController.createTag);

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Ambil semua tag milik user
 *     tags: [Tags]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Daftar tag
 */
router.get('/', authenticate, tagController.getTags);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Hapus tag
 *     tags: [Tags]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag berhasil dihapus
 */
router.delete('/:id', authenticate, tagController.deleteTag);

export default router;