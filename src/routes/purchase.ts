import express from 'express';
import { PublicKey } from '@solana/web3.js';
import { buyTicket, getProgram } from '../services/solanaService';
import { AppError } from '../utils/errorHandler';
import { AnchorError } from '@project-serum/anchor';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { buyerPublicKey, amount, authorityPublicKey, benefactorPublicKey } = req.body;

    if (!buyerPublicKey || !amount || !authorityPublicKey || !benefactorPublicKey) {
      throw new AppError('Missing required parameters', 400);
    }

    const buyer = new PublicKey(buyerPublicKey);
    const authority = new PublicKey(authorityPublicKey);
    const benefactor = new PublicKey(benefactorPublicKey);

    const result = await buyTicket(buyer, amount, authority, benefactor);

    res.json({
      message: 'Purchase transaction created successfully',
      ticketPublicKey: result.ticket.toString(),
      transaction: result.transaction.serialize({ requireAllSignatures: false }).toString('base64')
    });
  } catch (error) {
    if (error instanceof AnchorError) {
      next(new AppError(`Anchor error: ${error.error.errorMessage}`, 400));
    } else {
      next(error);
    }
  }
});

router.get('/ticket/:publicKey', async (req, res, next) => {
  try {
    const ticketPublicKey = new PublicKey(req.params.publicKey);
    const program = getProgram();
    const ticketAccount = await program.account.ticket.fetch(ticketPublicKey);
    res.json(ticketAccount);
  } catch (error) {
    next(new AppError('Failed to fetch ticket information', 400));
  }
});

export default router;