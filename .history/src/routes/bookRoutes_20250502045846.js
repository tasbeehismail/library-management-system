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



export default router; 