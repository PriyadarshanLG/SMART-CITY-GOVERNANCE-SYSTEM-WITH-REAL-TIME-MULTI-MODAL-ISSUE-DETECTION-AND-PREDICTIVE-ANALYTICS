import cors from 'cors';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(morgan('dev'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'smart-city-server' });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
