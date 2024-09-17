import { MongoClient, ObjectId } from 'mongodb';
import { Cache } from '../utils/cache';

const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
const db = mongoClient.db('your_database_name');

const cache = new Cache();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function updateCache(key: string, data: any) {
  cache.set(key, data, Date.now() + CACHE_TTL);
}

async function getFromCacheOrUpdate(key: string, updateFn: () => Promise<any>) {
  const cachedData = cache.get(key);
  if (cachedData && cachedData.expiry > Date.now()) {
    return cachedData.value;
  }

  const freshData = await updateFn();
  await updateCache(key, freshData);
  return freshData;
}

export async function handleTransactionCreated(data: any) {
  const { id, amount, userId } = data;
  const transaction = await db.collection('transactions').insertOne({
    _id: new ObjectId(id),
    amount,
    userId,
    createdAt: new Date()
  });
  const insertedTransaction = await db.collection('transactions').findOne({ _id: transaction.insertedId });
  await updateCache(`transaction:${id}`, insertedTransaction);
  console.log('Transaction created:', id);
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