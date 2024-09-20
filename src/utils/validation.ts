import Joi from 'joi';
import { PublicKey } from '@solana/web3.js';

export const transactionSchema = Joi.object({
  transactionId: Joi.string().required(),
  customerPubkey: Joi.string().custom((value, helpers) => {
    try {
      new PublicKey(value);
      return value;
    } catch (error) {
      return helpers.error('any.invalid');
    }
  }).required(),
  buyerAddress: Joi.string().custom((value, helpers) => {
    try {
      new PublicKey(value);
      return value;
    } catch (error) {
      return helpers.error('any.invalid');
    }
  }).required(),
  timestamp: Joi.number().integer().min(0).required(),
  tokenAmount: Joi.number().min(0).required(),
});

export const contributorSchema = Joi.object({
  customerPubkey: Joi.string().custom((value, helpers) => {
    try {
      new PublicKey(value);
      return value;
    } catch (error) {
      return helpers.error('any.invalid');
    }
  }).required(),
  numberOfTransactions: Joi.number().integer().min(0).required(),
  tokensPurchased: Joi.number().min(0).required(),
  lastTransactionDate: Joi.date().iso().required(),
});

export function validateTransaction(data: any) {
  return transactionSchema.validate(data);
}

export function validateContributor(data: any) {
  return contributorSchema.validate(data);
}