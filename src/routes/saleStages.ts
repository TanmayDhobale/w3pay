import express from 'express';
import SaleStage from '../models/SaleStage';
import { AppError } from '../utils/errorHandler';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    const saleStages = await SaleStage.find().sort({ start: 1 });
    res.json(saleStages);
  } catch (error) {
    next(new AppError('Error fetching sale stages', 500));
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const saleStage = await SaleStage.findById(req.params.id);
    if (!saleStage) {
      throw new AppError('Sale stage not found', 404);
    }
    res.json(saleStage);
  } catch (error) {
    next(error);
  }
});

router.get('/aggregated', async (req, res, next) => {
  try {
    const aggregatedData = await SaleStage.aggregate([
      {
        $group: {
          _id: null,
          totalStages: { $sum: 1 },
          totalAvailableAmount: { $sum: '$availableAmount' },
          totalSoldAmount: { $sum: '$soldAmount' },
          averageAvailableAmount: { $avg: '$availableAmount' },
          averageSoldAmount: { $avg: '$soldAmount' },
          stages: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          totalStages: 1,
          totalAvailableAmount: 1,
          totalSoldAmount: 1,
          averageAvailableAmount: 1,
          averageSoldAmount: 1,
          stages: 1
        }
      }
    ]);

    res.json(aggregatedData[0] || {});
  } catch (error) {
    next(new AppError('Error fetching aggregated sale stage data', 500));
  }
});

export default router;