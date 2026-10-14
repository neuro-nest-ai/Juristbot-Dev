const { MongoClient } = require('mongodb');
const { getSecret } = require('./valut');
require('dotenv').config();

let dbClient;

async function buildMongoConfig() {
  if (process.env.NODE_ENV === 'Dev') {
    if (!process.env.MONGODB_DEV_URL) {
      throw new Error('MONGODB_DEV_URL is not set in .env');
    }
    return {
      url: process.env.MONGODB_DEV_URL,
      database: process.env.MONGODB_DEV_DB || 'juristbot',
    };
  }

  const secret = await getSecret(process.env.MONGODB_URL_PATH);
  const {
    protocol = 'mongodb+srv',
    username,
    password,
    host,
    replicaSet,
    database,
    tls,
    authSource = 'admin',
  } = secret;

  if (!username || !password || !host || !database) {
    throw new Error('Missing required MongoDB connection parameters in Vault secret.');
  }

  const url = `${protocol}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${database}?authSource=${authSource}&replicaSet=${replicaSet}&tls=${tls}`;
  return { url, database };
}

async function connectToMongo(retries = 3, delay = 1000) {
  if (dbClient) return dbClient;

  const { url, database } = await buildMongoConfig();
  const client = new MongoClient(url);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.connect();
      dbClient = client.db(database);
      console.log(`Connected to MongoDB: ${database}`);
      return dbClient;
    } catch (err) {
      console.error(` MongoDB connection attempt ${attempt} failed:`, err);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('💥 All MongoDB connection attempts failed');
        throw err;
      }
    }
  }
}

module.exports = { connectToMongo };