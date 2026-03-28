import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MetricsEngine } from '../services/metrics';

const router = Router();
const prisma = new PrismaClient();
const mockOrgId = "demo-org-id";

router.get('/summary', async (req, res) => {
  try {
    const org = await prisma.organization.findFirst();
    const summary = await MetricsEngine.getSummary(org?.id || mockOrgId);
    res.json(summary || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics summary" });
  }
});

router.get('/history', async (req, res) => {
  try {
    const org = await prisma.organization.findFirst();
    const history = await MetricsEngine.getHistory(org?.id || mockOrgId);
    res.json(history || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics history" });
  }
});

export default router;
