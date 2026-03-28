import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import ingestionApi from './api/ingestion';
import reviewApi from './api/review';
import metricsApi from './api/metrics';
import explainabilityApi from './api/explainability';
import observabilityApi from './api/observability';
import './workers';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/ingest', ingestionApi);
app.use('/review', reviewApi);
app.use('/metrics', metricsApi);
app.use('/explainability', explainabilityApi);
app.use('/system', observabilityApi);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`CivicFlow API listening on port ${PORT}`);
});
