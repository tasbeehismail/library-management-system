import Member from '../models/Member.js';
import { ObjectId } from 'mongodb';

class MemberController {
    // CRUD Operations
    static async createMember(req, res) {
        try {
            const result = await Member.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllMembers(req, res) {
        try {
            const members = await Member.findAll();
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMemberById(req, res) {
        try {
            const member = await Member.findById(req.params.id);
            if (!member) {
                return res.status(404).json({ error: 'Member not found' });
            }
            res.json(member);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateMember(req, res) {
        try {
            const result = await Member.update(req.params.id, req.body);
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Member not found' });
            }
            res.json({ message: 'Member updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteMember(req, res) {
        try {
            const result = await Member.delete(req.params.id);
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Member not found' });
            }
            res.json({ message: 'Member deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Queries and Filters
    static async getMembersByJoinYear(req, res) {
        try {
            const year = parseInt(req.params.year);
            const members = await Member.findByJoinYear(year);
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMemberBooks(req, res) {
        try {
            const books = await Member.getBooksBorrowed(req.params.id);
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Aggregation Functions
    static async getBorrowingCounts(req, res) {
        try {
            const stats = await Member.getBooksBorrowedCount();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAverageBooksPerType(req, res) {
        try {
            const stats = await Member.getAverageBooksPerMembershipType();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMembersWithMoreThanXBooks(req, res) {
        try {
            const count = parseInt(req.params.count);
            const members = await Member.getMembersWithMoreThanXBooks(count);
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getMembershipTypeStats(req, res) {
        try {
            const stats = await Member.getMembershipTypeStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default MemberController; 