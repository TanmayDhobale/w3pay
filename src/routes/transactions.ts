import express from 'express';
import Transaction from '../models/Transaction';
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

router.get('/aggregated', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage: any = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate as string).getTime(),
        $lte: new Date(endDate as string).getTime()
      };
    }

    const aggregatedData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalUsdAmount: { $sum: '$usdAmount' },
          totalTokenAmount: { $sum: '$tokenAmount' },
          averageUsdAmount: { $avg: '$usdAmount' },
          currencies: { $addToSet: '$currency' },
          statuses: { $addToSet: '$status' }
        }
      },
      {
        $project: {
          _id: 0,
          totalTransactions: 1,
          totalUsdAmount: 1,
          totalTokenAmount: 1,
          averageUsdAmount: 1,
          currencies: 1,
          statuses: 1
        }
      }
    ]);

    res.json(aggregatedData[0] || {});
  } catch (error) {
    next(new AppError('Error fetching aggregated transaction data', 500));
  }
});


router.get('/summary-by-date', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage: any = {};
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate as string).getTime(),
        $lte: new Date(endDate as string).getTime()
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$timestamp' } } },
          totalTransactions: { $sum: 1 },
          totalUsdAmount: { $sum: '$usdAmount' },
          totalTokenAmount: { $sum: '$tokenAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(summary);
  } catch (error) {
    next(new AppError('Error fetching transaction summary by date', 500));
  }
});

export default router;