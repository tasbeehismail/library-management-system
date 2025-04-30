import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

class Book {
    static async collection() {
        const db = await getDB();
        return db.collection('books');
    }
    // CRUD Operations
    static async create(bookData) {
        const collection = await this.collection();
        return await collection.insertOne(bookData);
    }

    static async findAll() {
        const collection = await this.collection();
        return await collection.find({}).toArray();
    }

    static async findById(id) {
        const collection = await this.collection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    static async update(id, updateData) {
        const collection = await this.collection();
        return await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
    }

    static async delete(id) {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        await borrowings.deleteMany({ book_id: new ObjectId(id) });
        
        const collection = await this.collection();
        return await collection.deleteOne({ _id: new ObjectId(id) });
    }

    // Queries
    static async findByTitle(title) {
        const collection = await this.collection();
        return await collection.findOne({ title: title });
    }

    static async getBorrowers(bookId) {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        const members = db.collection('members');
        
        return await borrowings.aggregate([
            { $match: { book_id: new ObjectId(bookId) } },
            {
                $lookup: {
                    from: 'members',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'member_details'
                }
            },
            { $unwind: '$member_details' },
            {
                $project: {
                    _id: '$member_details._id',
                    name: '$member_details.name',
                    membership_type: '$member_details.membership_type',
                    borrow_date: 1,
                    return_date: 1
                }
            }
        ]).toArray();
    }

    static async getPopularBooks(minBorrowers = 2) {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        
        return await borrowings.aggregate([
            {
                $group: {
                    _id: '$book_id',
                    borrower_count: { $sum: 1 }
                }
            },
            { $match: { borrower_count: { $gt: minBorrowers } } },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'book_details'
                }
            },
            { $unwind: '$book_details' },
            {
                $project: {
                    title: '$book_details.title',
                    author: '$book_details.author',
                    borrower_count: 1
                }
            }
        ]).toArray();
    }
}

export default Book; 