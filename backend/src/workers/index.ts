import { classificationWorker } from './classification.worker';
import { documentsWorker } from './documents.worker';
import { negotiationWorker } from './negotiation.worker';
import { escalationWorker } from './escalation.worker';
import { learningWorker } from './learning.worker';
import { learningQueue } from './queues';

console.log('[Workers] Booting asynchronous queue handlers...');

// Start reproducible jobs
learningQueue.add('daily-learning', {}, {
  repeat: {
    pattern: '0 * * * *' // Every hour for demo purposes
  }
});

export {
  classificationWorker,
  documentsWorker,
  negotiationWorker,
  escalationWorker,
  learningWorker
};
