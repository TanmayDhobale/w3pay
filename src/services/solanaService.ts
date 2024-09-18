import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from '../idl.json';

export function initializeSolanaProgram() {
  console.log('PROGRAM_ID:', process.env.PROGRAM_ID);

  const connection = new Connection(process.env.SOLANA_RPC_URL as string);
  const provider = new AnchorProvider(connection, {} as any, {});

  if (!process.env.PROGRAM_ID || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(process.env.PROGRAM_ID)) {
    throw new Error('Invalid or missing PROGRAM_ID in environment variables');
  }

  const programId = new PublicKey(process.env.PROGRAM_ID);
  
  // Add error checking for idl
  if (!idl || typeof idl !== 'object' || !idl.instructions) {
    throw new Error('Invalid IDL file');
  }

  try {
    const program = new Program(idl as any, programId, provider);
    return program;
  } catch (error) {
    console.error('Error initializing Solana program:', error);
    throw error;
  }
}