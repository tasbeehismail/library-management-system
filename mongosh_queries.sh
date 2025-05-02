// Database Selection
show dbs
use library_db

// 1. Member Queries

// Insert a member
db.members.insertOne({
    "name": "Ahmed Mohammed",
    "age": "30",
    "membership_type": "premium",
    "join_year": 2025
});

// Update a member 
db.members.findOneAndUpdate(
    { _id: ObjectId("MEMBER_ID") },
    { $set: { "name": "Ahmed Updated" } },
    { returnDocument: 'after' }
);

// 2. Book Queries

// Insert a book
db.books.insertOne({
    "title": "Modern Egypt",
    "author": "Ahmed Ismail",
    "genre": "History",
    "year_published": 2020
});

// Update a book 
db.books.findOneAndUpdate(
    { _id: ObjectId("BOOK_ID") },
    { $set: { "title": "Modern Egypt - Revised Edition" } },
    { returnDocument: 'after' }
);

// 3. Borrowing Operations

// Record a borrowing
db.borrowings.insertOne({
    "member_id": ObjectId("MEMBER_ID"),
    "book_id": ObjectId("BOOK_ID"),
    "borrow_date": "2024-01-01"
});

// Update return date
db.borrowings.findOneAndUpdate(
    { _id: ObjectId("BORROWING_ID") },
    { $set: { "return_date": "2024-01-15" } },
    { returnDocument: 'after' }
);

// 4. Complex Queries

// List members who borrowed specific book
db.borrowings.aggregate([
    { $match: { book_id: ObjectId("BOOK_ID") } },
    {
        $lookup: {
            from: "members",
            localField: "member_id",
            foreignField: "_id",
            as: "borrower"
        }
    },
    { $unwind: "$borrower" },
    {
        $project: {
            _id: "$borrower._id",
            name: "$borrower.name",
            borrow_date: 1,
            return_date: 1
        }
    }
]);

// Find members who joined before 2020
db.members.find({ join_year: { $lt: 2020 } });


// Books borrowed by more than 2 members
db.borrowings.aggregate([
    {
        $group: {
            _id: "$book_id",
            borrowCount: { $sum: 1 }
        }
    },
    {
        $match: {
            borrowCount: { $gte: 2 }
        }
    },
    {
        $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "bookDetails"
        }
    },
    { $unwind: "$bookDetails" },
    {
        $project: {
            title: "$bookDetails.title",
            author: "$bookDetails.author",
            borrowCount: 1
        }
    }
]);

// Books borrowed by a specific member
db.borrowings.aggregate([
    { $match: { member_id: ObjectId("MEMBER_ID") } },
    {
        $lookup: {
            from: "books",
            localField: "book_id",
            foreignField: "_id",
            as: "book"
        }
    },
    { $unwind: "$book" },
    {
        $project: {
            title: "$book.title",
            author: "$book.author",
            borrow_date: 1,
            return_date: 1
        }
    }
]);

// 5. Aggregation Queries

// Count total books borrowed per member
db.borrowings.aggregate([
    {
        $group: {
            _id: "$member_id",
            total_books: { $sum: 1 }
        }
    },
    {
        $lookup: {
            from: "members",
            localField: "_id",
            foreignField: "_id",
            as: "member"
        }
    },
    { $unwind: "$member" },
    {
        $project: {
            member_name: "$member.name",
            total_books: 1
        }
    }
]);

// Average books borrowed per membership type
db.members.aggregate([
    {
        $lookup: {
            from: "borrowings",
            localField: "_id",
            foreignField: "member_id",
            as: "borrowings"
        }
    },
    {
        $group: {
            _id: "$membership_type",
            average_books: { $avg: { $size: "$borrowings" } }
        }
    }
]);

// Members who borrowed more than X books
db.borrowings.aggregate([
    {
        $group: {
            _id: "$member_id",
            total_borrowings: { $sum: 1 }
        }
    },
    {
        $match: {
            total_borrowings: { $gt: 2 }
        }
    },
    {
        $lookup: {
            from: "members",
            localField: "_id",
            foreignField: "_id",
            as: "member"
        }
    },
    { $unwind: "$member" },
    {
        $project: {
            member_name: "$member.name",
            total_borrowings: 1
        }
    }
]);

// Members grouped by membership type
db.members.aggregate([
    {
        $group: {
            _id: "$membership_type",
            count: { $sum: 1 }
        }
    }
]);

// 6. Delete Operations

// Delete a member (including associated borrowings)
db.members.deleteOne({ _id: ObjectId("MEMBER_ID") });

// Delete a book
db.books.deleteOne({ _id: ObjectId("BOOK_ID") });