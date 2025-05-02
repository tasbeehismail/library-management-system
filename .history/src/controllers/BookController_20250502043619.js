import Book from '../models/Book.js';
import { ObjectId } from 'mongodb';

// CRUD Operations
export const createBook = async (req, res) => {
    try {
        const result = await Book.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBook = async (req, res) => {
    try {
        const result = await Book.update(req.params.id, req.body);
        if (!result) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const result = await Book.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Queries and Filters
export const getBookBorrowers = async (req, res) => {
    try {
        // First check if book exists
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Get all members who borrowed this book
        const borrowers = await Book.getBorrowers(req.params.id);
        res.json({
            book: {
                _id: book._id,
                title: book.title,
                author: book.author
            },
            borrowers: borrowers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPopularBooks = async (req, res) => {
    try {
        const minBorrowers = parseInt(req.query.minBorrowers, 10) || 2;
        console.log("Using minBorrowers:", minBorrowers);
        
        const books = await Book.getPopularBooks(minBorrowers);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookByTitle = async (req, res) => {
    try {
        const book = await Book.findByTitle(req.params.title);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 