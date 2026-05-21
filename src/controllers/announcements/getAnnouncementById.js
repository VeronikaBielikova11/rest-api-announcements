import prisma from '../../../prisma/client.js';

export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id },
  });

  res.json(announcement);
};
