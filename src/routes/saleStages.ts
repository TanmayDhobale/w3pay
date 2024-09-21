import express, { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import SaleStage from '../models/SaleStage.js';
import { AppError } from '../utils/errorHandler.js';
import { cache } from '../utils/cache.js'; 

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request<{ customerPubkey?: string }>, res: Response, next: NextFunction) => {
  try {
    const { customerPubkey } = req.params;
    
    // Remove caching logic for now 
    const saleStages = await SaleStage.find({ customerPubkey }).sort({ start: 1 }).lean();
    
    res.json(saleStages);
  } catch (error) {
    next(new AppError('Error fetching sale stages', 500));
  }
});

router.get('/:id', async (req: express.Request<ParamsDictionary & { customerPubkey?: string }>, res, next) => {
  try {
    const { id, customerPubkey } = req.params;
    const saleStage = await SaleStage.findOne({ _id: id, customerPubkey });
    if (!saleStage) {
      throw new AppError('Sale stage not found', 404);
    }
    res.json(saleStage);
  } catch (error) {
    next(error);
  }
});

router.get('/aggregated', async (req: express.Request<{ customerPubkey?: string }>, res, next) => {
  try {
    const { customerPubkey } = req.params;
    const match = customerPubkey ? { customerPubkey } : {};

    const [summary, stages] = await Promise.all([
      SaleStage.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalStages: { $sum: 1 },
            totalAvailableAmount: { $sum: '$availableAmount' },
            totalSoldAmount: { $sum: '$soldAmount' },
            averageAvailableAmount: { $avg: '$availableAmount' },
            averageSoldAmount: { $avg: '$soldAmount' }
          }
        },
        { $project: { _id: 0 } }
      ]),
      SaleStage.find(match).sort({ start: 1 }).lean()
    ]);

    res.json({
      summary: summary[0] || {},
      stages: stages
    });
  } catch (error) {
    next(new AppError('Error fetching aggregated sale stage data', 500));
  }
});

export default router;