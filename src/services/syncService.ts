import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import Transaction from '../models/Transaction.js';
import Contributor from '../models/Contributor.js';
import SaleStage from '../models/SaleStage.js';
import { getEnhancedTransactions } from './heliusService.js';
import { validateTransaction, validateContributor } from '../utils/validation.js';
import { importJSON } from '../utils/jsonImport.js';

const idl = importJSON('src/idl.json');

async function getSaleStages(program: Program): Promise<any[]> {
  const saleStages = await program.account.saleStage.all();
  console.log(saleStages);

  return saleStages.map(stage => ({
    id: stage.publicKey.toString(),
    ...stage.account
  }));
}

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function startSyncService() {
  const connection = new Connection(process.env.SOLANA_RPC_URL as string);
  const provider = new AnchorProvider(connection, {} as any, {});
  const program = new Program(idl as any, new PublicKey(process.env.PROGRAM_ID as string), provider);

  setInterval(async () => {
    await syncTransactions(connection, program);
    await syncSaleStages(program);
  }, SYNC_INTERVAL);
}

async function syncTransactions(connection: Connection, program: Program) {
  try {
    const transactionsResponse = await getEnhancedTransactions(program.programId.toString());
    const transactions = Array.isArray(transactionsResponse) ? transactionsResponse : transactionsResponse.items || [];
    for (const tx of transactions) {
      if (tx.type === 'PROGRAM_CALL' && tx.programId === program.programId.toString()) {
        await processTransaction(tx, program);
      }
    }
  } catch (error) {
    console.error('Error syncing transactions:', error);
  }
}

async function processTransaction(transaction: any, program: Program) {
  const { signature, timestamp, instructions } = transaction;
  for (const ix of instructions) {
    if (ix.programId === program.programId.toString()) {
      const decodedIx = program.instruction.decode(ix.data, ix.programId) as any;
      if (decodedIx && decodedIx.name === 'buyTicket') {
        const { buyer, amount } = decodedIx.args;
        const transactionData = {
          transactionId: signature,
          customerPubkey: buyer.toString(),
          buyerAddress: buyer.toString(),
          timestamp: timestamp,
          tokenAmount: amount.toNumber(),
        };

        const { error: transactionError } = validateTransaction(transactionData);
        if (transactionError) {
          console.error('Invalid transaction data:', transactionError);
          return;
        }

        await Transaction.findOneAndUpdate(
          { transactionId: signature },
          transactionData,
          { upsert: true, new: true }
        );

        const contributorData = {
          publicKey: buyer.toString(),
          customerPubkey: [buyer.toString()], 
          numberOfTransactions: 1,
          tokensPurchased: amount.toNumber(),
          lastTransactionDate: new Date(timestamp),
        };

        const { error: contributorError } = validateContributor(contributorData);
        if (contributorError) {
          console.error('Invalid contributor data:', contributorError);
          return;
        }

        await Contributor.findOneAndUpdate(
          { publicKey: buyer.toString() },
          {
            $addToSet: { customerPubkey: buyer.toString() }, 
            $inc: { 
              numberOfTransactions: 1,
              tokensPurchased: amount.toNumber()
            },
            lastTransactionDate: new Date(timestamp),
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
      }

    }
  }
}

async function syncSaleStages(program: Program) {
  try {
    const saleStages = await getSaleStages(program);
    for (const stage of saleStages) {
      await SaleStage.findOneAndUpdate(
        { id: stage.id },
        stage,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error syncing sale stages:', error);
  }
}