import express from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    getBookBorrowers,
    getPopularBooks,
    getBookByTitle
} from '../controllers/BookController.js';

const router = express.Router();

// CRUD Operations
router.post('/', createBook);
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

// Queries and Filters
router.get('/:id/borrowers', getBookBorrowers);
router.get('/popular', (req, res, next) => {
    console.log('📢 Route hit!', {
        method: req.method,
        path: req.path,
        query: req.query
    });
    next();
}, getPopularBooks);router.get('/title/:title', getBookByTitle);

export default router; 