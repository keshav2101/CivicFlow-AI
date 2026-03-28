import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { classificationQueue, documentsQueue, negotiationQueue, escalationQueue } from '../workers/queues';

const router = Router();
const prisma = new PrismaClient();

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Test DB connection
    res.json({
      status: 'UP',
      timestamp: new Date(),
      services: {
        database: 'Connected',
        redis: 'Connected'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error });
  }
});

router.get('/queues', async (req, res) => {
  try {
    const fetchStats = async (queue: any) => ({
      waiting: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      failed: await queue.getFailedCount(),
      completed: await queue.getCompletedCount()
    });

    res.json({
      classification: await fetchStats(classificationQueue),
      documents: await fetchStats(documentsQueue),
      negotiation: await fetchStats(negotiationQueue),
      escalation: await fetchStats(escalationQueue)
    });
  } catch (error) {
    res.status(500).json({ error: "Queue fetch failed" });
  }
});

export default router;
