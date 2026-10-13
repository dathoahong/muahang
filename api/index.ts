import express from 'express';
import apiRouter from '../server/apiRouter';
import { initDb } from '../server/db';

const app = express();

app.use(express.json());

let initialized = false;
app.use(async (_req, _res, next) => {
  if (!initialized) {
    try {
      await initDb();
      initialized = true;
    } catch (e) {
      console.error('[Vercel Serverless] initDb error:', e);
    }
  }
  next();
});

// Handle both /api and direct root paths on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
