import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new AppError('Unauthorized', 401);
  }

  next();
};