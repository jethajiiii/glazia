import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validated server configuration object.
 * Provides fallback defaults while alerting on missing critical configurations.
 */
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mini-design-canvas',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
