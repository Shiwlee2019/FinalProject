const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
let client;

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('quizapp');
}

module.exports = connectToMongo;
