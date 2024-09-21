import * as bn from 'bn.js';
import * as express from 'express';
import * as expressServeStaticCore from 'express-serve-static-core';

declare global {
  namespace NodeJS {
    interface Global {
      BN: typeof bn;
    }
  }
}