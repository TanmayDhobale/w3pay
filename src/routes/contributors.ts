import express from 'express';
import Contributor from '../models/Contributor';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: express.Request<{ pubkey: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const contributor = await Contributor.findOne({ publicKey: pubkey });
    if (!contributor) {
      throw new AppError('Contributor not found', 404);
    }
    res.json(contributor);
  } catch (error) {
    next(new AppError('Error fetching contributor', 500));
  }
});

router.get('/details', async (req: express.Request<{ pubkey: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const contributor = await Contributor.findOne({ publicKey: pubkey });

    if (!contributor) {
      throw new AppError('Contributor not found', 404);
    }

    const recentTransactions = await Transaction.find({ buyerAddress: pubkey })
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