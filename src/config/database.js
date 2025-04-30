import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
import { createIndexes } from './indexes.js';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        if (!db) {
            await client.connect();
            console.log('Connected to MongoDB');
            db = client.db('library_db');
            
            await createIndexes();
        }
        return db;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

async function getDB() {
    if (!db) {
        await connectDB();
    }
    return db;
}

export { connectDB, getDB }; 