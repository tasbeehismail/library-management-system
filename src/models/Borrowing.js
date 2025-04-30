import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export default class Borrowing {
    constructor(data) {
        this.member_id = new ObjectId(data.member_id);
        this.book_id = new ObjectId(data.book_id);
        this.borrow_date = new Date(data.borrow_date);
        this.return_date = new Date(data.return_date);
        this.status = data.status || 'active';
    }

    static get collection() {
        return getDB().collection('borrowings');
    }

    // CRUD Operations
    static async create(data) {
        const borrowing = new Borrowing(data);
        const result = await this.collection.insertOne(borrowing);
        return { ...borrowing, _id: result.insertedId };
    }

    static async findAll() {
        return await this.collection.find().toArray();
    }

    static async findById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    static async update(id, data) {
        const updateData = { ...data };
        if (data.member_id) updateData.member_id = new ObjectId(data.member_id);
        if (data.book_id) updateData.book_id = new ObjectId(data.book_id);
        if (data.borrow_date) updateData.borrow_date = new Date(data.borrow_date);
        if (data.return_date) updateData.return_date = new Date(data.return_date);

        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    static async delete(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    // Queries and Filters
    static async findByMemberId(memberId) {
        return await this.collection.find({ member_id: new ObjectId(memberId) }).toArray();
    }

    static async findByBookId(bookId) {
        return await this.collection.find({ book_id: new ObjectId(bookId) }).toArray();
    }

    static async findActive() {
        return await this.collection.find({ status: 'active' }).toArray();
    }

    static async findOverdue() {
        const now = new Date();
        return await this.collection.find({
            status: 'active',
            return_date: { $lt: now }
        }).toArray();
    }

    // Aggregation Methods
    static async getMemberStats() {
        return await this.collection.aggregate([
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
                    member_name: { $concat: ['$member.first_name', ' ', '$member.last_name'] },
                    total_borrowings: 1,
                    active_borrowings: 1
                }
            }
        ]).toArray();
    }

    static async getBookStats() {
        return await this.collection.aggregate([
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
        const now = new Date();
        return await this.collection.aggregate([
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