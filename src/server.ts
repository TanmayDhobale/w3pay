import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import routes from './routes/index.js';
import { connectToDatabase } from './config/database';
import { errorHandler } from './utils/errorHandler';
import logger from './utils/logger';
import { startSyncService } from './services/syncService';
import { initializeSolanaProgram } from './services/solanaService';
import TestModel from './models/TestModel';

const app = express();
const PORT = process.env.PORT || 3000;

connectToDatabase();
initializeSolanaProgram();

app.use(express.json());
app.use('/api', routes);

app.use(errorHandler);

startSyncService().catch(logger.error);

app.get('/test-db', async (req, res) => {
  try {
    const newTest = new TestModel({ name: 'Test Entry' });
    await newTest.save();
    const allTests = await TestModel.find();
    res.json(allTests);
  } catch (error) {
    res.status(500).json({ error: 'Database operation failed' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export {};