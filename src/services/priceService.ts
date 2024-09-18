import  SaleStage from '../models/SaleStage';
import { SaleInstance } from '../models/SaleInstance'; 

interface PriceStrategy {
  type: 'Static' | 'TimeBased';
  basePrice?: number;
  priceIncrease?: number;
  timeBetweenIncrease?: number;
}

export async function calculateTokenPrice(tokenAmount: number): Promise<number> {
  const activeStage = await getActiveStage();
  if (!activeStage) {
    throw new Error('No active sale stage found');
  }

  const saleInstance = await SaleInstance.findOne(); // Assuming there's only one active sale instance
  if (!saleInstance) {
    throw new Error('No active sale instance found');
  }

  let pricePerToken: number;

  if (activeStage.priceStrategy.type === 'Static') {
    pricePerToken = saleInstance.microcent_per_allocation / 1000000;
  } else if (activeStage.priceStrategy.type === 'TimeBased') {
    pricePerToken = calculateTimeBasedPrice(activeStage.start, activeStage.priceStrategy, saleInstance);
  } else {
    throw new Error('Unknown price strategy');
  }

  // Calculate total price in dollars
  const totalPrice = pricePerToken * tokenAmount;

  return Number(totalPrice.toFixed(6)); // Round to 6 decimal places
}

async function getActiveStage(): Promise<any> {
  const currentTime = Date.now();
  return await SaleStage.findOne({
    start: { $lte: currentTime },
    end: { $gt: currentTime }
  }).sort({ start: -1 });
}

function calculateTimeBasedPrice(stageStart: number, priceStrategy: PriceStrategy, saleInstance: any): number {
  const basePrice = saleInstance.microcent_per_allocation / 1000000; // Convert to dollars
  const priceIncrease = saleInstance.microcent_price_step / 1000000; // Convert to dollars
  const timeBetweenIncrease = saleInstance.hours_per_increase * 60 * 60 * 1000; // convert hours to milliseconds

  const elapsedTime = Date.now() - stageStart;
  const increaseCount = Math.floor(elapsedTime / timeBetweenIncrease);

  return basePrice + (priceIncrease * increaseCount);
}