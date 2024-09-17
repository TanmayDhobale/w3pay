import { Program } from '@project-serum/anchor';

declare global {
  namespace Express {
    interface Request {
      program?: Program;
    }
  }
}

export {};