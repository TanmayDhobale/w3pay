import { MongoClient, ObjectId } from 'mongodb';
import { cache } from '../utils/cache.js';
import { calculateTokenPrice } from '../services/priceService.js';
import Transaction from '../models/Transaction.js';

const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
const db = mongoClient.db('your_database_name');

const CACHE_TTL = 5 * 60 * 1000 ; 

async function updateCache(key: string, data: any) {
  await cache.set(key, JSON.stringify(data), CACHE_TTL / 1000);
}

async function getFromCacheOrUpdate(key: string, updateFn: () => Promise<any>) {
  const cachedData = await cache.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const freshData = await updateFn();
  await updateCache(key, freshData);
  return freshData;
}

export async function handleTransactionCreated(data: any) {
  try {
    const transaction = new Transaction(data);
    await transaction.save();
    
    // Remove or comment out these lines
    // const key = `transaction:${data.id}`;
    // await cache.set(key, JSON.stringify(data), CACHE_TTL / 1000);
    
    console.log('Transaction created and saved:', transaction);
  } catch (error) {
    console.error('Error handling transaction creation:', error);
  }
}

export async function handleContributorUpdated(data: any) {
  const { id, name, email } = data;
  const result = await db.collection('contributors').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { name, email, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (result?.value) {
    await updateCache(`contributor:${id}`, result.value);
    console.log('Contributor updated:', id);
  } else {
    console.log('Contributor not found:', id);
  }
}

export async function handleSaleStageChanged(data: any) {
  const { saleId, newStage } = data;
  const sale = await db.collection('sales').findOneAndUpdate(
    { _id: new ObjectId(saleId) },
    { $set: { stage: newStage, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (sale && sale.value) {
    await updateCache(`sale:${saleId}`, sale.value);
    console.log('Sale stage changed:', saleId, 'to', newStage);
  } else {
    console.log('Sale not found:', saleId);
  }
}

export async function getTransaction(id: string) {
  return getFromCacheOrUpdate(`transaction:${id}`, async () => {
    const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
    if (transaction) {
      console.log('Transaction found in database:', transaction);
      await updateCache(`transaction:${id}`, transaction);
    } else {
      console.log('Transaction not found in database:', id);
    }
    return transaction;
  });
}