import Borrowing from '../models/Borrowing.js';
import { ObjectId } from 'mongodb';

export default class BorrowingController {
    // CRUD Operations
    static async createBorrowing(req, res) {
        try {
            console.log("Hi there")
            const borrowing = await Borrowing.create(req.body);
            res.status(201).json(borrowing);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getAllBorrowings(req, res) {
        try {
            const borrowings = await Borrowing.findAll();
            res.json(borrowings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getBorrowingById(req, res) {
        try {
            const borrowing = await Borrowing.findById(req.params.id);
            if (!borrowing) {
                return res.status(404).json({ message: 'Borrowing not found' });
            }
            res.json(borrowing);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateBorrowing(req, res) {
        try {
            const borrowing = await Borrowing.update(req.params.id, req.body);
            if (!borrowing) {
                return res.status(404).json({ message: 'Borrowing not found' });
            }
            res.json(borrowing);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateReturnDate(req, res) {
        try {
            const { return_date } = req.body;
            if (!return_date) {
                return res.status(400).json({ message: 'Return date is required' });
            }

            const borrowing = await Borrowing.updateReturnDate(req.params.id, return_date);
            if (!borrowing) {
                return res.status(404).json({ message: 'Borrowing not found' });
            }
            res.json(borrowing);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async deleteBorrowing(req, res) {
        try {
            const result = await Borrowing.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Borrowing not found' });
            }
            res.json({ message: 'Borrowing deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Queries and Filters
    static async getBorrowingsByMember(req, res) {
        try {
            const borrowings = await Borrowing.findByMemberId(req.params.memberId);
            res.json(borrowings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getBorrowingsByBook(req, res) {
        try {
            const borrowings = await Borrowing.findByBookId(req.params.bookId);
            res.json(borrowings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getActiveBorrowings(req, res) {
        try {
            const borrowings = await Borrowing.findActive();
            res.json(borrowings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getOverdueBorrowings(req, res) {
        try {
            const borrowings = await Borrowing.findOverdue();
            res.json(borrowings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Aggregation Routes
    static async getMemberBorrowingStats(req, res) {
        try {
            const stats = await Borrowing.getMemberStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getBookBorrowingStats(req, res) {
        try {
            const stats = await Borrowing.getBookStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getOverdueStats(req, res) {
        try {
            const stats = await Borrowing.getOverdueStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
} 