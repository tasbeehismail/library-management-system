import express from 'express';
import BorrowingController from '../controllers/BorrowingController.js';

const router = express.Router();

// CRUD Operations
router.post('/', BorrowingController.createBorrowing);
router.get('/', BorrowingController.getAllBorrowings);
router.get('/:id', BorrowingController.getBorrowingById);
router.put('/:id', BorrowingController.updateBorrowing);
router.put('/:id/return', BorrowingController.updateReturnDate); 
router.delete('/:id', BorrowingController.deleteBorrowing);

// Queries and Filters
router.get('/member/:memberId', BorrowingController.getBorrowingsByMember);
router.get('/book/:bookId', BorrowingController.getBorrowingsByBook);
router.get('/active', BorrowingController.getActiveBorrowings);
router.get('/overdue', BorrowingController.getOverdueBorrowings);

// Aggregation Routes
router.get('/stats/member', BorrowingController.getMemberBorrowingStats);
router.get('/stats/book', BorrowingController.getBookBorrowingStats);
router.get('/stats/overdue', BorrowingController.getOverdueStats);

export default router; 