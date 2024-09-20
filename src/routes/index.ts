import express from 'express';
import transactionRoutes from './transactions';
import contributorRoutes from './contributors';
import saleStageRoutes from './saleStages';
import purchaseRoutes from './purchase';
import { authMiddleware } from '../middleware/auth';
import { handleTransactionCreated, handleContributorUpdated, handleSaleStageChanged } from '../handlers/webhookHandlers';

const router = express.Router();
const customerRouter = express.Router({ mergeParams: true });
customerRouter.use('/transactions', transactionRoutes);
customerRouter.use('/contributors', contributorRoutes);
customerRouter.use('/sale-stages', saleStageRoutes);
router.use('/customer/:pubkey', authMiddleware, customerRouter);

router.use('/purchase', authMiddleware, purchaseRoutes);
router.use('/blink', authMiddleware, purchaseRoutes);
router.post('/webhook', async (req, res) => {
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

export default router;