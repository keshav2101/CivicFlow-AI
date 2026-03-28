import { Router } from 'express';
import { ExplainabilityLayer } from '../services/explainability';

const router = Router();

router.get('/ticket/:id/explain', async (req, res) => {
  try {
    const data = await ExplainabilityLayer.getTicketExplanation(req.params.id);
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI explanation" });
  }
});

router.get('/clause/:id/explain', async (req, res) => {
  try {
    const data = await ExplainabilityLayer.getClauseExplanation(req.params.id);
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clause explanation" });
  }
});

export default router;
