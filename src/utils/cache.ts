import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err: Error) => console.log('Redis Client Error', err));

export const cache = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  setex: promisify(client.setex).bind(client),
};