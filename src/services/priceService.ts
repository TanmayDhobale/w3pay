import { Decimal } from 'decimal.js';
import SaleStage from '../models/SaleStage.js';
import { SaleInstance } from '../models/SaleInstance.js';

enum PriceStrategyType {
  Static = 'Static',
  TimeBased = 'TimeBased'
}

interface PriceStrategy {
  type: PriceStrategyType;
  basePrice?: number;
  priceIncrease?: number;
  timeBetweenIncrease?: number;
}

export async function calculateTokenPrice(tokenAmount: number): Promise<string> {
  const activeStage = await getActiveStage();
  if (!activeStage) {
    throw new Error('No active sale stage found');
  }

  const saleInstance = await SaleInstance.findOne();
  if (!saleInstance) {
    throw new Error('No active sale instance found');
  }

  let pricePerToken: Decimal;

  if (activeStage.priceStrategy.type === PriceStrategyType.Static) {
    pricePerToken = new Decimal(saleInstance.microcent_per_allocation).dividedBy(1000000);
  } else if (activeStage.priceStrategy.type === PriceStrategyType.TimeBased) {
    pricePerToken = calculateTimeBasedPrice(activeStage.start, activeStage.priceStrategy, saleInstance);
  } else {
    throw new Error('Unknown price strategy');
  }

  const totalPrice = pricePerToken.times(tokenAmount);

  return totalPrice.toFixed(6); 
}

async function getActiveStage(): Promise<any> {
  const currentTime = Date.now();
  return await SaleStage.findOne({
    start: { $lte: currentTime },
    end: { $gt: currentTime }
  }).sort({ start: -1 });
}

function calculateTimeBasedPrice(stageStart: number, priceStrategy: PriceStrategy, saleInstance: any): Decimal {
  const basePrice = new Decimal(saleInstance.microcent_per_allocation).dividedBy(1000000);
  const priceIncrease = new Decimal(saleInstance.microcent_price_step).dividedBy(1000000);
  const timeBetweenIncrease = saleInstance.hours_per_increase * 60 * 60 * 1000;

  const elapsedTime = Date.now() - stageStart;
  const increaseCount = Math.floor(elapsedTime / timeBetweenIncrease);

  return basePrice.plus(priceIncrease.times(increaseCount));
}