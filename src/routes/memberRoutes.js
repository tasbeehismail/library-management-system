import express from 'express';
import MemberController from '../controllers/MemberController.js';

const router = express.Router();

// CRUD Operations
router.post('/', MemberController.createMember);
router.get('/', MemberController.getAllMembers);

// Queries and Filters
router.get('/borrowing-counts', MemberController.getBorrowingCounts);
router.get('/join-year/:year', MemberController.getMembersByJoinYear);
router.get('/:id/books', MemberController.getMemberBooks);
4

// Aggregation Routes
router.get('/stats/membership-types', MemberController.getMembershipTypeStats);
router.get('/stats/avg-books', MemberController.getAverageBooksPerType);
router.get('/stats/borrowed-more-than/:count', MemberController.getMembersWithMoreThanXBooks);

export default router; 