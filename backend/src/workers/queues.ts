import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null // Required by bullmq
});

export const classificationQueue = new Queue('classification', { connection });
export const documentsQueue = new Queue('documents', { connection });
export const negotiationQueue = new Queue('negotiation', { connection });
export const escalationQueue = new Queue('escalation', { connection });
export const learningQueue = new Queue('learning', { connection });
