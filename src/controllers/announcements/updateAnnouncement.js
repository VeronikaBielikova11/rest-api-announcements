import fs from 'fs/promises';
import createHttpError from 'http-errors';
import prisma from '../../../prisma/client.js';
import cloudinary from '../../cloudinary.js';
import logger from '../../logger.js';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
};

export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw createHttpError(404, 'Announcement not found');
  }

  if (announcement.userId !== req.user.id) {
    throw createHttpError(403, 'Access denied');
  }

  const data = {
    ...(req.body.title && { title: req.body.title }),
    ...(req.body.description && { description: req.body.description }),
    ...(req.body.price !== undefined && { price: parseNumber(req.body.price) }),
    ...(req.body.category && { category: req.body.category }),
    ...(req.body.contactInfo && { contactInfo: req.body.contactInfo }),
  };

  let uploadedFilePath;

  try {
    if (req.file) {
      uploadedFilePath = req.file.path;
      const uploadResult = await cloudinary.uploader.upload(uploadedFilePath, {
        folder: 'announcements',
      });
      data.imageUrl = uploadResult.secure_url;
      logger.info({ announcementId: id, userId: req.user.id, imageUrl: data.imageUrl }, 'Announcement photo uploaded');
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data,
    });

    logger.info({ announcementId: id, userId: req.user.id }, 'Announcement updated');

    res.json(updated);
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
};
