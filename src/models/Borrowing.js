import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export default class Borrowing {
    constructor(data) {
        this.member_id = new ObjectId(data.member_id);
        this.book_id = new ObjectId(data.book_id);
        this.borrow_date = new Date(data.borrow_date);
        this.return_date = data.return_date ? new Date(data.return_date) : null;
        this.status = data.status || 'active';
    }

    static async getCollection() {
        const db = await getDB();
        return db.collection('borrowings');
    }

    // CRUD Operations
    static async create(data) {
        const borrowing = new Borrowing(data);
        const collection = await this.getCollection();
        const result = await collection.insertOne(borrowing);
        return { ...borrowing, _id: result.insertedId };
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
        const updateData = { ...data };
        if (data.member_id) updateData.member_id = new ObjectId(data.member_id);
        if (data.book_id) updateData.book_id = new ObjectId(data.book_id);
        if (data.borrow_date) updateData.borrow_date = new Date(data.borrow_date);
        if (data.return_date) updateData.return_date = new Date(data.return_date);

        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    static async updateReturnDate(id, returnDate) {
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    return_date: new Date(returnDate),
                    status: 'returned'
                }
            },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    static async delete(id) {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Queries and Filters
    static async findByMemberId(memberId) {
        const collection = await this.getCollection();
        return await collection.find({ member_id: new ObjectId(memberId) }).toArray();
    }

    static async findByBookId(bookId) {
        const collection = await this.getCollection();
        return await collection.find({ book_id: new ObjectId(bookId) }).toArray();
    }

    static async findActive() {
        const collection = await this.getCollection();
        return await collection.find({ status: 'active' }).toArray();
    }

    static async findOverdue() {
        const collection = await this.getCollection();
        const now = new Date();
        return await collection.find({
            status: 'active',
            return_date: { $lt: now }
        }).toArray();
    }

    // Aggregation Methods
    static async getMemberStats() {
        const collection = await this.getCollection();
        return await collection.aggregate([
            {
                $group: {
                    _id: '$member_id',
                    total_borrowings: { $sum: 1 },
                    active_borrowings: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'member'
                }
            },
            { $unwind: '$member' },
            {
                $project: {
                    member_name: '$member.name',
                    total_borrowings: 1,
                    active_borrowings: 1
                }
            }
        ]).toArray();
    }

    static async getBookStats() {
        const collection = await this.getCollection();
        return await collection.aggregate([
            {
                $group: {
                    _id: '$book_id',
                    total_borrowings: { $sum: 1 },
                    active_borrowings: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'book'
                }
            },
            { $unwind: '$book' },
            {
                $project: {
                    book_title: '$book.title',
                    book_author: '$book.author',
                    total_borrowings: 1,
                    active_borrowings: 1
                }
            }
        ]).toArray();
    }

    static async getOverdueStats() {
        const collection = await this.getCollection();
        const now = new Date();
        return await collection.aggregate([
            {
                $match: {
                    status: 'active',
                    return_date: { $lt: now }
                }
            },
            {
                $group: {
                    _id: null,
                    total_overdue: { $sum: 1 },
                    average_days_overdue: {
                        $avg: {
                            $divide: [
                                { $subtract: [now, '$return_date'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            }
        ]).toArray();
    }
} 