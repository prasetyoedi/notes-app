import { Router } from 'express';
import * as noteController from '../controllers/noteController';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Buat note baru
 *     tags: [Notes]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Note berhasil dibuat
 */
router.post('/', authenticate, noteController.createNote);

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Ambil semua note dengan pagination, search, filter
 *     tags: [Notes]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci untuk search title/content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: comma-separated tag ids
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daftar note
 */
router.get('/', authenticate, noteController.getNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Ambil detail note
 *     tags: [Notes]
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
 *         description: Detail note
 */
router.get('/:id', authenticate, noteController.getNoteDetail);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update note
 *     tags: [Notes]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Note berhasil diupdate
 */
router.put('/:id', authenticate, noteController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Hapus note
 *     tags: [Notes]
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
 *         description: Note berhasil dihapus
 */
router.delete('/:id', authenticate, noteController.deleteNote);

// Tambahkan di bawah route delete

/**
 * @swagger
 * /notes/{id}/archive:
 *   put:
 *     summary: Arsipkan note
 *     tags: [Notes]
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
 *         description: Note berhasil diarsipkan
 */
router.put('/:id/archive', authenticate, noteController.archiveNote);

/**
 * @swagger
 * /notes/{id}/unarchive:
 *   put:
 *     summary: Kembalikan note dari arsip
 *     tags: [Notes]
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
 *         description: Note berhasil dikembalikan
 */
router.put('/:id/unarchive', authenticate, noteController.unarchiveNote);

export default router;