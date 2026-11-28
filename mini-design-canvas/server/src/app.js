import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing restricted to client origin
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);

// Rate limiting middleware on all API routes
export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: () => config.isTest,
});

app.use('/api', apiLimiter);

// Body parsing with configurable safe size limits
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

// HTTP request logging (disabled in test runs to keep output clean)
if (!config.isTest) {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Health check at root and /health for platform uptime monitors (e.g. Render)
app.get(['/', '/health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Unknown routes 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
