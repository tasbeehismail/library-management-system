import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
import { createIndexes } from './indexes.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db';
const client = new MongoClient(uri);

let db;

export async function connectDB() {
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

export async function getDB() {
    if (!db) {
        db = await connectDB();
    }
    return db;
}

export async function closeDB() {
    if (client) {
        await client.close();
        db = null;
        console.log('MongoDB connection closed');
    }
} 