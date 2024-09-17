import express from 'express';
import Contributor from '../models/Contributor';
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

export default router;