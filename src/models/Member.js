import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

class Member {
    static async collection() {
        const db = await getDB();
        return db.collection('members');
    }

    // CRUD Operations
    static async create(memberData) {
        const collection = await this.collection();
        return await collection.insertOne(memberData);
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
        await borrowings.deleteMany({ member_id: new ObjectId(id) });
        
        const collection = await this.collection();
        return await collection.deleteOne({ _id: new ObjectId(id) });
    }

    // Queries
    static async findByJoinYear(year) {
        const collection = await this.collection();
        return await collection.find({ join_year: { $lt: year } }).toArray();
    }

    static async getBooksBorrowed(memberId) {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        const books = db.collection('books');
        
        return await borrowings.aggregate([
            { $match: { member_id: new ObjectId(memberId) } },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book_id',
                    foreignField: '_id',
                    as: 'book_details'
                }
            },
            { $unwind: '$book_details' },
            {
                $project: {
                    _id: '$book_details._id',
                    title: '$book_details.title',
                    author: '$book_details.author',
                    borrow_date: 1,
                    return_date: 1
                }
            }
        ]).toArray();
    }

    // Aggregations
    static async getBooksBorrowedCount() {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        
        return await borrowings.aggregate([
            {
                $group: {
                    _id: '$member_id',
                    total_books_borrowed: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'members',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'member_info'
                }
            },
            {
                $project: {
                    member_name: { $arrayElemAt: ['$member_info.name', 0] },
                    total_books_borrowed: 1
                }
            }
        ]).toArray();
    }

    static async getMembershipTypeStats() {
        const collection = await this.collection();
        return await collection.aggregate([
            {
                $group: {
                    _id: '$membership_type',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
    }

    static async getAverageBooksPerMembershipType() {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        
        return await borrowings.aggregate([
            {
                $lookup: {
                    from: 'members',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'member_info'
                }
            },
            { $unwind: '$member_info' },
            {
                $group: {
                    _id: '$member_info.membership_type',
                    average_books: { $avg: 1 }
                }
            }
        ]).toArray();
    }

    static async getMembersWithMoreThanXBooks(x) {
        const db = await getDB();
        const borrowings = db.collection('borrowings');
        
        return await borrowings.aggregate([
            {
                $group: {
                    _id: '$member_id',
                    total_books: { $sum: 1 }
                }
            },
            { $match: { total_books: { $gt: x } } },
            {
                $lookup: {
                    from: 'members',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'member_info'
                }
            },
            { $unwind: '$member_info' },
            {
                $project: {
                    member_name: '$member_info.name',
                    membership_type: '$member_info.membership_type',
                    total_books: 1
                }
            }
        ]).toArray();
    }
}

export default Member; 