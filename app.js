import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { errors as celebrateErrors } from 'celebrate';
import announcementsRouter from './src/routes/announcements.routes.js';
import authRouter from './src/routes/auth.routes.js';
import { authRateLimiter } from './src/middleware/rateLimiter.middleware.js';
import logger from './src/logger.js';
import 'dotenv/config';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    optionsSuccessStatus: 200,
  }),
);
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRateLimiter, authRouter);
app.use('/announcements', announcementsRouter);
app.use(celebrateErrors());

// 404 Not Found handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  // JSON parsing errors (invalid JSON format)
  if (err.type === 'entity.parse.failed' && err.status === 400) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON',
      validation: {
        body: {
          source: 'body',
          keys: [],
          message: 'Invalid JSON format in request body',
        },
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint failed' });
  }

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }

  if (err.status || err.statusCode) {
    return res
      .status(err.status || err.statusCode)
      .json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
});
