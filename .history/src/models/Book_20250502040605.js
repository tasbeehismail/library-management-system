import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export default class Book {
    constructor(data) {
        this.title = data.title;
        this.author = data.author;
        this.genre = data.genre;
        this.year_published = data.year_published;
    }

    static async getCollection() {
        const db = await getDB();
        return db.collection('books');
    }

    static async getBorrowingsCollection() {
        const db = await getDB();
        return db.collection('borrowings');
    }

    // CRUD Operations
    static async create(data) {
        const book = new Book(data);
        const collection = await this.getCollection();
        const result = await collection.insertOne(book);
        return { ...book, _id: result.insertedId };
    }

    static async findAll() {
        const collection = await this.getCollection();
        return await collection.find().toArray();
    }

    static async findById(id) {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    static async update(id, data) {
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: 'after' }
        );
        return result;
    }

    static async delete(id) {
        const bookId = new ObjectId(id);
        
        // First delete all borrowings associated with this book
        const borrowingsCollection = await this.getBorrowingsCollection();
        await borrowingsCollection.deleteMany({ book_id: bookId });
        
        // Then delete the book
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: bookId });
        return result.deletedCount > 0;
    }

    // Queries
    static async findByTitle(title) {
        const collection = await this.getCollection();
        return await collection.findOne({ title: title });
    }

    static async getBorrowers(bookId) {
        const borrowingsCollection = await this.getBorrowingsCollection();
        return await borrowingsCollection.aggregate([
            { $match: { book_id: new ObjectId(bookId) } },
            {
                $lookup: {
                    from: 'members',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'member'
                }
            },
            { $unwind: '$member' },
            {
                $project: {
                    _id: '$member._id',
                    name: '$member.name',
                    email: '$member.email',
                    membership_type: '$member.membership_type',
                    borrow_date: 1,
                    return_date: 1,
                    status: 1
                }
            },
            {
                $sort: { borrow_date: -1 }
            }
        ]).toArray();
    }

    static async getPopularBooks(minBorrowers = 2) {
        const borrowingsCollection = await this.getBorrowingsCollection();
        return await borrowingsCollection.aggregate([
            {
                $match: {
                    book_id: { $type: 'string', $regex: /^[a-fA-F0-9]{24}$/ }
                }
            },
            {
                $group: {
                    _id: '$book_id',
                    borrower_count: { $sum: 1 }
                }
            },
            // Step 3: Filter by minBorrowers
            {
                $match: { borrower_count: { $gt: minBorrowers } }
            },
            // Step 4: Convert _id (book_id) to ObjectId
            {
                $addFields: {
                    convertedId: { $toObjectId: '$_id' }
                }
            },
            {
                $lookup: {
                    from: 'books',
                    localField: 'convertedId',
                    foreignField: '_id',
                    as: 'book'
                }
            },
            { $unwind: '$book' },
            {
                $project: {
                    title: '$book.title',
                    author: '$book.author',
                    borrower_count: 1
                }
            }
        ]).toArray();
    }
    
} 