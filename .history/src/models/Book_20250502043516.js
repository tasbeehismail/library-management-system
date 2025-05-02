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

    // ======================
    // DEBUGGING SECTION START
    // ======================
    console.log("\n=== DEBUGGING INVALID book_id VALUES ===");
    
    // 1. Find all invalid book_id formats
    const invalidRecords = await borrowingsCollection.find({
        $or: [
            { book_id: { $exists: false } },
            { book_id: null },
            { book_id: { $not: /^[0-9a-fA-F]{24}$/ } }
        ]
    }).toArray();

    console.log(`Found ${invalidRecords.length} problematic records:`);
    
    // Log sample of invalid IDs with their types
    invalidRecords.slice(0, 5).forEach(doc => {
        console.log(`- Value: ${doc.book_id} (Type: ${typeof doc.book_id})`);
    });

    // 2. Check distribution of book_id types
    const typeAnalysis = await borrowingsCollection.aggregate([
        {
            $project: {
                type: { $type: "$book_id" }
            }
        },
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    console.log("\nbook_id Type Analysis:");
    typeAnalysis.forEach(type => {
        console.log(`- ${type._id}: ${type.count} records`);
    });
    // ======================
    // DEBUGGING SECTION END
    // ======================

    return await borrowingsCollection.aggregate([
        // Only include documents with valid ObjectIds
        {
            $match: {
                book_id: { $regex: /^[0-9a-fA-F]{24}$/ }
            }
        },
        {
            $group: {
                _id: '$book_id',
                borrower_count: { $sum: 1 }
            }
        },
        { $match: { borrower_count: { $gt: minBorrowers } } },
        {
            $addFields: {
                convertedId: { $toObjectId: "$_id" }
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