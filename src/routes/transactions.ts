import express from 'express';
import  Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const transactions = await Transaction.find()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ timestamp: -1 });

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    next(new AppError('Error fetching transactions', 500));
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ transactionId: req.params.id });
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;