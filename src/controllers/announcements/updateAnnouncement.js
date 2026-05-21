import prisma from '../../../prisma/client.js';

export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.update({
    where: { id },
    data: req.body,
  });

  res.json(announcement);
};
