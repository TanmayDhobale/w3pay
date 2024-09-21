import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  
  console.log('Received request for:', req.path);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Received API Key:', apiKey);
  console.log('Expected API Key:', process.env.API_KEY);
  console.log('API Keys match:', apiKey === process.env.API_KEY);
  console.log('API Key from .env exists:', !!process.env.API_KEY);

  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log('Unauthorized access attempt');
    return next(new AppError('Unauthorized', 401));
  }

  console.log('Authorization successful');
  next();
};