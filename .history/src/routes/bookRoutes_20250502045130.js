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
router.use((req, res, next) => {
    console.log("Middleware before /popular route");
    next();  // Make sure to call next to continue to the route handler
});router.get('/popular', async (req, res) => {
    console.log("Request to /popular route received");
    await getPopularBooks(req, res);
});router.get('/title/:title', getBookByTitle);

export default router; 