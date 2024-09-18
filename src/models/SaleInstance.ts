// Mock database
const mockDatabase: SaleInstance = {
  microcent_per_allocation: 1000000, // 10 cents
  microcent_price_step: 100000, // 1 cent
  hours_per_increase: 24,
};

export interface SaleInstance {
  microcent_per_allocation: number;
  microcent_price_step: number;
  hours_per_increase: number;
}

export const SaleInstance = {
  findOne: async (): Promise<SaleInstance | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDatabase;
  }
};
