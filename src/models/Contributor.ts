import mongoose from 'mongoose';

const ContributorSchema = new mongoose.Schema({
  customerPubkey: { type: String, required: true, index: true },
  numberOfTransactions: { type: Number, default: 0 },
  totalUsdAmount: { type: Number, default: 0 },
  lastTransactionDate: Date,
  amountPerCurrency: {
    SOL: { type: Number, default: 0 },
    USDC: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 }
  },
  tokensPurchased: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Contributor', ContributorSchema);