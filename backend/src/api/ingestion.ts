import { Router } from 'express';
import { WhatsAppAdapter } from '../channels/whatsapp.adapter';
import { EmailAdapter } from '../channels/email.adapter';
import { WebAdapter } from '../channels/web.adapter';
import { IngestionService } from '../services/ingestion';

const router = Router();

router.post('/whatsapp', async (req, res) => {
  try {
    const event = WhatsAppAdapter.parsePayload(req.body);
    await IngestionService.ingestEvent(event);
    
    // Immediate acknowledgement
    res.status(200).send('Event received');
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/email', async (req, res) => {
  try {
    const event = EmailAdapter.parsePayload(req.body);
    await IngestionService.ingestEvent(event);
    
    res.status(200).send('Event received');
  } catch (error) {
    console.error('Error processing Email webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/web', async (req, res) => {
  try {
    const event = WebAdapter.parsePayload(req.body);
    await IngestionService.ingestEvent(event);
    res.status(200).send('Event received');
  } catch (error) {
    console.error('Error processing Web webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
