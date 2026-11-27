import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Mount API routes
app.use('/api', apiRouter);

// Unknown routes 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
