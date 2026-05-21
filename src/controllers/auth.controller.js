import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import prisma from '../../prisma/client.js';

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  const { username, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw createHttpError(409, 'User with this username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });

  res.status(201).json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });

  res.json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  });
};

export const refreshTokens = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!existingToken) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  await prisma.refreshToken.delete({
    where: { id: existingToken.id },
  });

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
    },
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export const logout = async (req, res) => {
  await prisma.refreshToken.deleteMany({
    where: { userId: req.user.id },
  });

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.json(sanitizeUser(user));
};
