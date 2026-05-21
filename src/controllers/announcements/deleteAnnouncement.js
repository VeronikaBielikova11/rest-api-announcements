import prisma from '../../../prisma/client.js';

export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id);

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).end();
};
