import { Router } from 'express';
import { getAnnouncements } from '../controllers/announcements/getAnnouncements.js';
import { getAnnouncementById } from '../controllers/announcements/getAnnouncementById.js';
import { createAnnouncement } from '../controllers/announcements/createAnnouncement.js';
import { updateAnnouncement } from '../controllers/announcements/updateAnnouncement.js';
import { deleteAnnouncement } from '../controllers/announcements/deleteAnnouncement.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  getAnnouncementsValidator,
  getByIdValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
  deleteAnnouncementValidator,
} from '../validators/announcements.validators.js';

const router = Router();

/**
 * @openapi
 * /announcements:
 *   get:
 *     summary: Get announcements list
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for title
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         description: Sort by creation date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       '200':
 *         description: List of announcements with pagination metadata
 */
router.get('/', getAnnouncementsValidator, getAnnouncements);

/**
 * @openapi
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Announcement object
 *       '404':
 *         description: Announcement not found
 */
router.get('/:id', getByIdValidator, getAnnouncementById);

/**
 * @openapi
 * /announcements:
 *   post:
 *     summary: Create a new announcement
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, price, category, contactInfo]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Created announcement
 *       '400':
 *         description: Validation failed
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  createAnnouncementValidator,
  createAnnouncement,
);

/**
 * @openapi
 * /announcements/{id}:
 *   patch:
 *     summary: Partially update announcement fields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Updated announcement
 *       '400':
 *         description: Validation failed or body is empty
 *       '404':
 *         description: Announcement not found
 */
router.patch(
  '/:id',
  authenticate,
  upload.single('image'),
  updateAnnouncementValidator,
  updateAnnouncement,
);

/**
 * @openapi
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Announcement deleted successfully
 *       '404':
 *         description: Announcement not found
 */
router.delete(
  '/:id',
  authenticate,
  deleteAnnouncementValidator,
  deleteAnnouncement,
);

export default router;
