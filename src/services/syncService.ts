import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import Transaction from '../models/Transaction';
import Contributor from '../models/Contributor';
import SaleStage from '../models/SaleStage';
import idl from '../idl.json';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function startSyncService() {
  const connection = new Connection(process.env.SOLANA_RPC_URL as string);
  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(idl as any, new PublicKey(process.env.PROGRAM_ID as string), provider);

  setInterval(async () => {
    await syncTransactions(program);
    await syncContributors(program);
    await syncSaleStages(program);
  }, SYNC_INTERVAL);
}

async function syncTransactions(program: Program) {
  const tickets = await program.account.ticket.all();
  for (const ticket of tickets) {
    // Convert ticket data to Transaction model and upsert
    await Transaction.findOneAndUpdate(
      { transactionId: ticket.publicKey.toString() },
      {
        buyerAddress: ticket.account.buyer.toString(),
        recipientAddress: ticket.account.saleInstance.toString(),
        timestamp: ticket.account.lastUpdated.toNumber(),
        tokenAmount: ticket.account.unspent.toNumber() + ticket.account.spent.toNumber(),
        // more fields here 
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  }
}

async function syncContributors(program: Program) {
  const tickets = await program.account.ticket.all();
  for (const ticket of tickets) {
    const publicKey = ticket.account.buyer.toString();
    const tokenAmount = ticket.account.unspent.toNumber() + ticket.account.spent.toNumber();
    
    await Contributor.findOneAndUpdate(
      { publicKey },
      {
        $inc: { 
          numberOfTransactions: 1,
          tokensPurchased: tokenAmount
        },
        lastTransactionDate: new Date(ticket.account.lastUpdated.toNumber() * 1000),
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  }
}

async function syncSaleStages(program: Program) {
  const saleStages = await program.account.saleStages.all();
  for (const stage of saleStages) {
    await SaleStage.findOneAndUpdate(
      { start: stage.account.start.toNumber() },
      {
        end: stage.account.end.toNumber(),
        availableAmount: stage.account.availableAmount.toString(),
        soldAmount: stage.account.soldAmount.toString(),
        vestedSale: stage.account.vestedSale,
        priceStrategy: stage.account.priceStrategy,
        whitelistStrategy: stage.account.whitelistStrategy,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  }
}