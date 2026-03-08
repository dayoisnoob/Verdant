import 'dotenv/config';
import { app } from './app';
import { logger } from './config/pino';

const PORT = process.env.PORT || 7000;
const NODE_ENV = process.env.NODE_ENV;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Working environment: ${NODE_ENV}`);
});

process.on('SIGTERM', () => {
  logger.info('Sigterm received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SigIntreceived, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});
