import fs from 'fs/promises';
import prisma from '../../../prisma/client.js';
import cloudinary from '../../cloudinary.js';
import logger from '../../logger.js';

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  return Number(value);
};

export const createAnnouncement = async (req, res) => {
  const data = {
    title: req.body.title,
    description: req.body.description,
    price: parseNumber(req.body.price),
    category: req.body.category,
    contactInfo: req.body.contactInfo,
    userId: req.user.id,
  };

  let uploadedFilePath;

  try {
    if (req.file) {
      uploadedFilePath = req.file.path;
      const uploadResult = await cloudinary.uploader.upload(uploadedFilePath, {
        folder: 'announcements',
      });
      data.imageUrl = uploadResult.secure_url;
      logger.info({ userId: req.user.id, imageUrl: data.imageUrl }, 'Announcement photo uploaded');
    }

    const announcement = await prisma.announcement.create({
      data,
    });

    logger.info({ announcementId: announcement.id, userId: req.user.id }, 'Announcement created');

    res.status(201).json(announcement);
  } finally {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
  }
};
