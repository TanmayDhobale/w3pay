import express from 'express';
import Contributor from '../models/Contributor';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: express.Request<{ pubkey: string }, {}, {}, { page?: string, limit?: string }>, res, next) => {
  try {
    const { pubkey } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');

    const contributors = await Contributor.find({ customerPubkeys: pubkey })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ lastTransactionDate: -1 });

    const total = await Contributor.countDocuments({ customerPubkeys: pubkey });

    res.json({
      contributors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalContributors: total
    });
  } catch (error) {
    next(new AppError('Error fetching contributors', 500));
  }
});

export default router;