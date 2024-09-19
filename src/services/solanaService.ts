import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Wallet } from '@project-serum/anchor';
import idl from '../idl.json';

let program: Program;

export function initializeSolanaProgram() {
  const connection = new Connection(process.env.SOLANA_RPC_URL as string);
  const wallet = new Wallet(Keypair.generate());
  const provider = new AnchorProvider(connection, wallet, {});
  program = new Program(idl as any, new PublicKey(process.env.PROGRAM_ID as string), provider);
  return program;
}

export function getProgram(): Program {
  if (!program) {
    throw new Error('Solana program not initialized');
  }
  return program;
}

export async function buyTicket(buyer: PublicKey, amount: number, authority: PublicKey, benefactor: PublicKey) {
  const program = getProgram();
  const ticket = Keypair.generate();
  const aggregator = new PublicKey(process.env.AGGREGATOR_ADDRESS as string);

  try {
    const instruction = await program.methods
      .buyTicket(new BN(amount))
      .accounts({
        authority: authority,
        buyer: buyer,
        ticket: ticket.publicKey,
        aggregator,
        benefactor: benefactor,
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    

    return { transaction, ticket: ticket.publicKey };
  } catch (error) {
    console.error('Error creating buy ticket instruction:', error);
    throw new Error('Failed to create buy ticket instruction');
  }
}