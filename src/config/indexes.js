import { getDB } from './database.js';

export async function createIndexes() {
    const db = await getDB();

    await db.collection('members').createIndexes([
        { key: { _id: 1 } },
        { key: { membership_type: 1, join_year: 1 } },
        { key: { name: 1 } },
        { key: { join_year: 1 } }
    ]);

    await db.collection('books').createIndexes([
        { key: { _id: 1 } },
        { key: { title: 1, author: 1 } },
        { key: { genre: 1 } },
        { key: { year_published: 1 } }
    ]);

    await db.collection('borrowings').createIndexes([
        { key: { _id: 1 } },
        { key: { member_id: 1, book_id: 1 } },
        { key: { return_date: 1 } },
        { key: { member_id: 1, return_date: 1 } },
        { key: { book_id: 1, return_date: 1 } },
        { key: { borrow_date: 1 } }
    ]);
} 