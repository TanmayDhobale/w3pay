import express from 'express';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: express.Request<{ pubkey: string }, {}, {}, { page?: string, limit?: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');

    const transactions = await Transaction.find({ customerPubkey: pubkey })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ timestamp: -1 });

    const total = await Transaction.countDocuments({ customerPubkey: pubkey });

    res.json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total
    });
  } catch (error) {
    next(new AppError('Error fetching transactions', 500));
  }
});

router.get('/:id', async (req: express.Request<{ pubkey: string; id: string }>, res, next) => {
  try {
    const { pubkey, id } = req.params;
    const transaction = await Transaction.findOne({ transactionId: id, customerPubkey: pubkey });
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

export default router;