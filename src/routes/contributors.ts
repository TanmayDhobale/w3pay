import express from 'express';
import Contributor from '../models/Contributor';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: express.Request<{ pubkey: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const contributors = await Contributor.find({ customer: pubkey })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ timestamp: -1 });;
    
    const total = await Transaction.countDocuments({ customer: pubkey });

    res.json({
      contributor: contributors,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    next(new AppError('Error fetching contributor', 500));
  }
});

router.get('/:contributorPubkey', async (req: express.Request<{ pubkey: string, contributorPubkey: string }>, res, next) => {
  try {
    const { pubkey, contributorPubkey } = req.params;
    const contributor = await Contributor.findOne({ publicKey: contributorPubkey, customer: pubkey });

    if (!contributor) {
      throw new AppError('Contributor not found', 404);
    }

    const recentTransactions = await Transaction.find({ customer: pubkey })
      .sort({ timestamp: -1 })
      .limit(5);

    const response = {
      ...contributor.toObject(),
      recentTransactions
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;