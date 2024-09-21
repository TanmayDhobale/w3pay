import dotenv from 'dotenv';
dotenv.config();

console.log('API_KEY from env:', process.env.API_KEY);

import express from 'express';
import routes from './routes/index.js';
import { connectToDatabase } from './config/database.js';
import { errorHandler } from './utils/errorHandler.js';
import logger from './utils/logger.js';
import { startSyncService } from './services/syncService.js';
import { initializeSolanaProgram } from './services/solanaService.js';
import TestModel from './models/TestModel.js';
import { importJSON } from './utils/jsonImport.js';

const idl = importJSON('src/idl.json');

const app = express();
const PORT = process.env.PORT || 3000;

connectToDatabase();
initializeSolanaProgram();

// Remove or comment out these lines
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);
// ... any other Redis-related code

app.get('/', (req, res) => {
  res.send('Hey, this is Web3 Pay');
});

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

startSyncService().catch((error) => {
  console.error('Error starting sync service:', error);
  logger.error('Error starting sync service:', error);
});

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
  console.log(`Server running on port ${PORT}`);
});

export {};