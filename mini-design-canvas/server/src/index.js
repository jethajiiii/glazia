import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

let server;

async function startServer() {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn(
      `[Database Warning] Unable to connect to MongoDB (${err.message}). Starting server in offline DB mode.`,
    );
  }

  server = app.listen(config.port, () => {
    console.info(`Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
  });
}

/**
 * Handles graceful process termination
 *
 * @param {string} signal - Triggering termination signal
 */
async function handleShutdown(signal) {
  console.info(`\nReceived ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(() => {
      console.info('HTTP server closed.');
    });
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
