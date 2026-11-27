import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Configure global Mongoose behavior
 */
mongoose.set('strictQuery', true);

// Set up connection lifecycle event listeners
mongoose.connection.on('connected', () => {
  console.info(`MongoDB connection established: ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection disconnected');
});

/**
 * Connect to MongoDB database.
 *
 * @param {string} [uri=config.mongoUri] - Database connection string
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDatabase(uri = config.mongoUri) {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

/**
 * Close active MongoDB connection gracefully.
 *
 * @returns {Promise<void>}
 */
export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.info('MongoDB connection closed gracefully');
  }
}
