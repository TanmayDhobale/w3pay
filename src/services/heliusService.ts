import { Helius } from 'helius-sdk';

const helius = new Helius(process.env.HELIUS_API_KEY!);

export async function getEnhancedTransactions(address: string, options?: any) {
  try {
    const transactions = await helius.rpc.getSignaturesForAsset({
      address,
      ...options
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching enhanced transactions:', error);
    throw error;
  }
}

export async function getAssetsByOwner(ownerAddress: string, page: number = 1) {
  try {
    const assets = await helius.rpc.getAssetsByOwner({
      ownerAddress,
      page
    });
    return assets;
  } catch (error) {
    console.error('Error fetching assets by owner:', error);
    throw error;
  }
}