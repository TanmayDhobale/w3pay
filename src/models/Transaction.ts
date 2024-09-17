import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  buyerAddress: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  timestamp: { type: Number, required: true },
  tokenAmount: { type: Number, required: true },
  usdAmount: { type: Number, required: true },
  currency: { type: String, required: true },
  currencyAmount: { type: Number, required: true },
  feeAmount: { type: Number, required: true },
  status: { type: String, required: true },
  directPurchase: { type: Boolean, required: true },
  crossChainTransaction: { type: Boolean, required: true },
  crossChainDetails: {
    sourceChain: String,
    sourceCurrency: String,
    sourceAddress: String,
    sourceTransactionId: String,
    sourceAmount: Number
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', TransactionSchema);