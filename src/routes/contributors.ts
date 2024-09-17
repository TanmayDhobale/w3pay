import express from 'express';
import Contributor from '../models/Contributor';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/errorHandler';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const contributors = await Contributor.find()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ totalUsdAmount: -1 });

    const total = await Contributor.countDocuments();

    res.json({
      contributors,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    next(new AppError('Error fetching contributors', 500));
  }
});

router.get('/:publicKey', async (req, res, next) => {
  try {
    const contributor = await Contributor.findOne({ publicKey: req.params.publicKey });
    if (!contributor) {
      throw new AppError('Contributor not found', 404);
    }
    res.json(contributor);
  } catch (error) {
    next(error);
  }
});

// New route for aggregated contributor data
router.get('/aggregated', async (req, res, next) => {
  try {
    const aggregatedData = await Contributor.aggregate([
      {
        $group: {
          _id: null,
          totalContributors: { $sum: 1 },
          totalTokensPurchased: { $sum: '$tokensPurchased' },
          totalTransactions: { $sum: '$numberOfTransactions' },
          averageTokensPurchased: { $avg: '$tokensPurchased' },
          topContributors: { 
            $push: { 
              publicKey: '$publicKey', 
              tokensPurchased: '$tokensPurchased',
              totalUsdAmount: '$totalUsdAmount'
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalContributors: 1,
          totalTokensPurchased: 1,
          totalTransactions: 1,
          averageTokensPurchased: 1,
          topContributors: { $slice: ['$topContributors', 10] }
        }
      }
    ]);

    res.json(aggregatedData[0] || {});
  } catch (error) {
    next(new AppError('Error fetching aggregated contributor data', 500));
  }
});

router.get('/:publicKey/details', async (req, res, next) => {
  try {
    const { publicKey } = req.params;
    const contributor = await Contributor.findOne({ publicKey });

    if (!contributor) {
      throw new AppError('Contributor not found', 404);
    }

    const recentTransactions = await Transaction.find({ buyerAddress: publicKey })
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