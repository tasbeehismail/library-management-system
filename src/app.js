import express from 'express';
import { connectDB, closeDB } from './config/database.js';
import memberRoutes from './routes/memberRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import borrowingRoutes from './routes/borrowingRoutes.js';

const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());

// Connect to MongoDB before setting up routes
let db;

app.use(async (req, res, next) => {
    try {
        if (!db) {
            db = await connectDB();
        }
        next();
    } catch (error) {
        next(error);
    }
});

app.use('/api/members', memberRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrowings', borrowingRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
    try {
        db = await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('SIGINT', async () => {
    try {
        await closeDB();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

startServer(); 