import prisma from '../../../prisma/client.js';

export const createAnnouncement = async (req, res) => {
  const announcement = await prisma.announcement.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });

  res.status(201).json(announcement);
};
