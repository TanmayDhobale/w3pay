import express from 'express';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: express.Request<{ pubkey: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const transactions = await Transaction.find({ buyerAddress: pubkey })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ timestamp: -1 });

    const total = await Transaction.countDocuments({ buyerAddress: pubkey });

    res.json({
      transactions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    next(new AppError('Error fetching transactions', 500));
  }
});

router.get('/:pubkey/:id', async (req, res, next) => {
  try {
    const { pubkey, id } = req.params;
    const transaction = await Transaction.findOne({ transactionId: id, buyerAddress: pubkey });
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;