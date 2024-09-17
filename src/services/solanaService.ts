// import { Connection, PublicKey } from '@solana/web3.js';
// import { Program, AnchorProvider } from '@project-serum/anchor';
// import idl from '../idl.json';

// export function initializeSolanaProgram() {
//   console.log('PROGRAM_ID:', process.env.PROGRAM_ID); // Add this line

//   const connection = new Connection(process.env.SOLANA_RPC_URL as string);
//   const provider = new AnchorProvider(connection, {} as any, {});

//   // Check if PROGRAM_ID is defined and is a valid base58 string
//   console.log('PROGRAM_ID:', process.env.PROGRAM_ID);

//   if (!process.env.PROGRAM_ID || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(process.env.PROGRAM_ID)) {
//     throw new Error('Invalid or missing PROGRAM_ID in environment variables');
//   }

//   const programId = new PublicKey(process.env.PROGRAM_ID);
//   const program = new Program(idl as any, programId, provider);

//   return program;
// }