import express, { Request, Response, NextFunction } from 'express';
import transactionRoutes from './transactions.js';
import contributorRoutes from './contributors.js';
import saleStageRoutes from './saleStages.js';
import purchaseRoutes from './purchase.js';
import { authMiddleware } from '../middleware/auth.js';
import { handleTransactionCreated, handleContributorUpdated, handleSaleStageChanged } from '../handlers/webhookHandlers.js';

const router = express.Router();
const customerRouter = express.Router({ mergeParams: true });
customerRouter.use('/transactions', transactionRoutes);
customerRouter.use('/contributors', contributorRoutes);
customerRouter.use('/sale-stages', saleStageRoutes);
router.use('/customer/:pubkey', authMiddleware, customerRouter);

router.use('/purchase', authMiddleware, purchaseRoutes);
router.use('/blink', authMiddleware, purchaseRoutes);
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event, data } = req.body;

    switch (event) {
      case 'transaction_created':
        await handleTransactionCreated(data);
        break;
      case 'contributor_updated':
        await handleContributorUpdated(data);
        break;
      case 'sale_stage_changed':
        await handleSaleStageChanged(data);
        break;
      default:
        console.warn(`Unhandled webhook event: ${event}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.use('/customer/:pubkey', authMiddleware, saleStageRoutes);

export default router;