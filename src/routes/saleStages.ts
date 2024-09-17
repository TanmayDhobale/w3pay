import express from 'express';
import SaleStage from '../models/SaleStage';
import { AppError } from '../utils/errorHandler';

const router = express.Router();

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

export default router;