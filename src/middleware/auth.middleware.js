import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      username: payload.username,
    };
    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
};
