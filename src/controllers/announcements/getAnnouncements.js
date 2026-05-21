import prisma from '../../../prisma/client.js';

export const getAnnouncements = async (req, res) => {
  const { search = '', sort = 'newest', page = 1 } = req.query;

  const perPage = 10;
  const skip = (Number(page) - 1) * perPage;

  const where = search
    ? {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      }
    : {};

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.announcement.count({ where }),
  ]);

  res.json({
    data,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};
