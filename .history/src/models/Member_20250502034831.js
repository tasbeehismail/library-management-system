import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

export default class Member {
    constructor(data) {
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.membership_type = data.membership_type;
        this.join_year = data.join_year;
        this.age = data.age
    }

    static async getCollection() {
        const db = await getDB();
        return db.collection('members');
    }

    static async getBorrowingsCollection() {
        const db = await getDB();
        return db.collection('borrowings');
    }

    // CRUD Operations
    static async create(data) {
        const member = new Member(data);
        const collection = await this.getCollection();
        const result = await collection.insertOne(member);
        return { ...member, _id: result.insertedId };
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
        const memberId = new ObjectId(id);
        
        // First delete all borrowings associated with this member
        const borrowingsCollection = await this.getBorrowingsCollection();
        await borrowingsCollection.deleteMany({ member_id: memberId });
        
        // Then delete the member
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: memberId });
        return result.deletedCount > 0;
    }

    // Queries and Filters
    static async findByJoinYear(year) {
        const collection = await this.getCollection();
        return await collection.find({ join_year: year }).toArray();
    }

    static async getBorrowedBooks(memberId) {
        const borrowingsCollection = await this.getBorrowingsCollection();
        const borrowings = await borrowingsCollection.find({ 
            member_id: new ObjectId(memberId) 
        }).toArray();
        
        const bookIds = borrowings.map(b => b.book_id);
        const db = await getDB();
        const books = await db.collection('books').find({
            _id: { $in: bookIds }
        }).toArray();
        
        return books;
    }

    // Aggregation Methods
    static async getBorrowingCounts() {
        const borrowingsCollection = await this.getBorrowingsCollection();
        const membersCollection = await this.getCollection();
        
        const members = await membersCollection.find().toArray();
        const memberMap = new Map(members.map(m => [m._id.toString(), m]));
        
        const borrowings = await borrowingsCollection.aggregate([
            {
                $group: {
                    _id: '$member_id',
                    total_borrowings: { $sum: 1 },
                    active_borrowings: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    }
                }
            }
        ]).toArray();

        return borrowings.map(b => ({
            member_id: b._id.toString(),
            member_name: memberMap.get(b._id.toString())?.name || 'Unknown Member',
            total_borrowings: b.total_borrowings,
            active_borrowings: b.active_borrowings
        })).sort((a, b) => b.total_borrowings - a.total_borrowings);
    }

    static async getAverageBooksPerType() {
        const borrowingsCollection = await this.getBorrowingsCollection();
        const membersCollection = await this.getCollection();

        const membershipTypes = await membersCollection.distinct('membership_type');
        
        const memberCounts = await membersCollection.aggregate([
            {
                $group: {
                    _id: '$membership_type',
                    total_members: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const borrowingStats = await borrowingsCollection.aggregate([
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
                $group: {
                    _id: '$member.membership_type',
                    total_borrowings: { $sum: 1.0 } 
                }
            }
        ]).toArray();
        
        const borrowingMap = new Map(borrowingStats.map(stat => [stat._id, stat.total_borrowings]));
        const memberCountMap = new Map(memberCounts.map(count => [count._id, count.total_members]));

        return membershipTypes.map(type => ({
            _id: type,
            average_books: Number((borrowingMap.get(type) || 0) / (memberCountMap.get(type)  || 1)).toFixed(2)
        }));
    }

    static async getMembersWithMoreThanXBooks(count) {
        const borrowingsCollection = await this.getBorrowingsCollection();
        return await borrowingsCollection.aggregate([
            {
                $group: {
                    _id: '$member_id',
                    total_borrowings: { $sum: 1 }
                }
            },
            { $match: { total_borrowings: { $gt: count } } },
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
                    total_borrowings: 1
                }
            }
        ]).toArray();
    }

    static async getMembershipTypeStats() {
        const collection = await this.getCollection();
        return await collection.aggregate([
            {
                $group: {
                    _id: '$membership_type',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
    }
} 