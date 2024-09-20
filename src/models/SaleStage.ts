import mongoose from 'mongoose';

const SaleStageSchema = new mongoose.Schema({
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  availableAmount: { type: Number, required: true },
  soldAmount: { type: Number, required: true },
  vestedSale: { type: Boolean, required: true },
  priceStrategy: { type: Object, required: true },
  whitelistStrategy: { type: Object, required: true },
  lastUpdated: { type: Date, default: Date.now },
  customerPubkey: { type: String, required: true, index: true }
});

SaleStageSchema.index({ customerPubkey: 1, start: 1 });

export default mongoose.model('SaleStage', SaleStageSchema);