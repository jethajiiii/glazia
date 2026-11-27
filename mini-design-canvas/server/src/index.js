import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.info('SIGTERM received. Closing HTTP server...');
  server.close(() => {
    console.info('HTTP server closed.');
    process.exit(0);
  });
});
