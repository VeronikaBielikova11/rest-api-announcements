import createHttpError from 'http-errors';
import prisma from '../../../prisma/client.js';

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

  const updated = await prisma.announcement.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
};
