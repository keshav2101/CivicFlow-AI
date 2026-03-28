import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { optimizeRoutingRules } from '../services/adaptive';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export const learningWorker = new Worker('learning', async job => {
  console.log(`[LearningWorker] Running adaptive policies routing updates`);
  await optimizeRoutingRules();
}, { connection, concurrency: 1 });
