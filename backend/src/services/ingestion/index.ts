import { NormalizedEvent } from '../../channels/types';
import { classificationQueue } from '../../workers/queues';

export class IngestionService {
  static async ingestEvent(event: NormalizedEvent) {
    console.log(`[IngestionService] Enqueuing event ${event.id} from ${event.channel} for classification`);
    
    // Idempotency enforced natively by providing jobId
    await classificationQueue.add('classify-event', event, {
      jobId: event.id, 
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
    
    return { status: 'queued', eventId: event.id };
  }
}
