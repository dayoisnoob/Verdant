import { beforeAll, afterAll, vi } from 'vitest';
import { closeDb } from '../config/db';
import { logger } from '../config/logger';

vi.mock('../queues/email.queue', () => ({
  queueEmail: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  logger.info('Test suite starting');
});

afterAll(async () => {
  await closeDb();
});
