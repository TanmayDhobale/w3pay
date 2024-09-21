import express from 'express';
import { PublicKey } from '@solana/web3.js';
import { buyTicket, getProgram } from '../services/solanaService';
import { AppError } from '../utils/errorHandler';
import { AnchorError } from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';

function isBNCompatible(value: unknown): value is string | number | Buffer | number[] | Uint8Array | BN {
  return typeof value === 'string' 
    || typeof value === 'number' 
    || Buffer.isBuffer(value)
    || Array.isArray(value) 
    || value instanceof Uint8Array 
    || BN.isBN(value);
}

function safeBN(value: unknown): BN {
  if (isBNCompatible(value)) {
    return new BN(value);
  }
  throw new Error(`Invalid value for BN: ${value}`);
}

export function toBN(value: unknown): BN {
  if (typeof value === 'string' || typeof value === 'number') {
    return new BN(value);
  } else if (value instanceof BN) {
    return value;
  } else if (Array.isArray(value) || value instanceof Uint8Array || value instanceof Buffer) {
    return new BN(value);
  }
  throw new Error('Invalid type for BN conversion');
}

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const buyerPublicKey = req.body.buyer || req.query.buyer;
    const authorityPublicKey = process.env.AUTHORITY_PUBLIC_KEY;
    const benefactorPublicKey = process.env.BENEFACTOR_PUBLIC_KEY;

    if (!buyerPublicKey || !amount || !authorityPublicKey || !benefactorPublicKey) {
      throw new AppError('Missing required parameters', 400);
    }

    const buyer = new PublicKey(buyerPublicKey);
    const authority = new PublicKey(authorityPublicKey);
    const benefactor = new PublicKey(benefactorPublicKey);

    const result = await buyTicket(buyer, parseFloat(amount), authority, benefactor);

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

// Add this new route
router.get('/blink-data', async (req, res, next) => {
  try {
    const currentPrice = await fetchCurrentPrice();
    const marketCap = await fetchMarketCap();
    const change24h = await fetch24hChange();

    const blinkData = {
      icon: 'https://path-to-your-bless-icon.png',
      label: 'Pump $BLESS',
      title: 'Pump God Bless The Memes',
      description: 'God bless the memes',
      links: 1,
      actions: [
        {
          label: '0.1 SOL',
          href: `${process.env.API_BASE_URL}/api/purchase?amount=0.1`
        },
        {
          label: '0.5 SOL',
          href: `${process.env.API_BASE_URL}/api/purchase?amount=0.5`
        },
        {
          label: '1 SOL',
          href: `${process.env.API_BASE_URL}/api/purchase?amount=1`
        },
        {
          label: 'Pump',
          href: `${process.env.API_BASE_URL}/api/purchase`,
          parameters: [
            {
              name: 'amount',
              label: 'Enter custom SOL amount'
            }
          ]
        }
      ],
      token: {
        symbol: '$BLESS',
        price: currentPrice,
        marketCap: marketCap,
        change24h: change24h
      },
      ca: 'HokhDNyQdXG3agBVXCKeQmPJ3e7D5jrWP2xUjxDB4nw3'
    };

    res.json(blinkData);
  } catch (error) {
    next(new AppError('Failed to fetch blink data', 500));
  }
});

async function fetchCurrentPrice(): Promise<string> {
  const program = getProgram();
  const tokenAccountPubkey = new PublicKey(process.env.TOKEN_ACCOUNT_PUBKEY || '');

  try {
    const tokenAccount = await program.account.tokenAccount.fetch(tokenAccountPubkey);
    const currentPrice = new BN(tokenAccount.price as number);
    const price = currentPrice.divn(1e9).toNumber(); 
    return price.toFixed(9);
  } catch (error) {
    console.error('Error fetching current price:', error);
    return '0.000000000';
  }
}

async function fetchMarketCap(): Promise<string> {
  const program = getProgram();
  const tokenAccountPubkey = new PublicKey(process.env.TOKEN_ACCOUNT_PUBKEY || '');

  try {
    const tokenAccount = await program.account.tokenAccount.fetch(tokenAccountPubkey);
    const totalSupply = new BN(tokenAccount.totalSupply as number);
    const price = new BN(tokenAccount.price as number);
    const marketCap = totalSupply.mul(price).divn(1e9).toNumber(); 
    return marketCap.toFixed(2);
  } catch (error) {
    console.error('Error fetching market cap:', error);
    return '0.00';
  }
}

async function fetch24hChange(): Promise<string> {
  const program = getProgram();
  const tokenAccountPubkey = new PublicKey(process.env.TOKEN_ACCOUNT_PUBKEY || '');

  try {
    const tokenAccount = await program.account.tokenAccount.fetch(tokenAccountPubkey);
    const currentPrice = new BN(tokenAccount.price as number);
    const previousPrice = new BN(tokenAccount.previousDayPrice as number);
    const change = currentPrice.sub(previousPrice).muln(100).div(previousPrice);
    return `${change.toNumber().toFixed(2)}%`;
  } catch (error) {
    console.error('Error fetching 24h change:', error);
    return '0.00%';
  }
}

export default router;