# Library Management System

A MongoDB-based library management system with RESTful API endpoints for managing members, books, and borrowings.

## Features

### 1. CRUD Operations
- Members and Books management
- Borrowing records management
- Return date updates
- Cascade delete for members and their borrowings

### 2. Queries and Filters
- List members who borrowed a specific book
- Find members by join year
- List popular books (borrowed by multiple members)
- Display member's borrowed books

### 3. Aggregation Features
- Count books borrowed per member
- Average books borrowed by membership type
- List members with more than X books
- Member statistics by membership type

## API Endpoints

### Members
```
POST   /api/members                          # Create member
GET    /api/members                          # List all members
GET    /api/members/:id                      # Get member details
PUT    /api/members/:id                      # Update member
DELETE /api/members/:id                      # Delete member and their borrowings

# Queries
GET    /api/members/filter/join-year/:year   # Members who joined before year
GET    /api/members/:id/books                # Books borrowed by member

# Aggregations
GET    /api/members/stats/borrowing-counts   # Books borrowed per member
GET    /api/members/stats/average-books      # Average books by membership type
GET    /api/members/stats/borrowed-more-than/:count  # Members with >X books
GET    /api/members/stats/membership-types   # Members by membership type
```

### Books
```
POST   /api/books                            # Create book
GET    /api/books                            # List all books
GET    /api/books/:id                        # Get book details
PUT    /api/books/:id                        # Update book
DELETE /api/books/:id                        # Delete book

# Queries
GET    /api/books/:id/borrowers              # Members who borrowed the book
GET    /api/books/popular                    # Books borrowed by >2 members
```

### Borrowings
```
POST   /api/borrowings                       # Create borrowing record
PUT    /api/borrowings/:id/return            # Update return date
DELETE /api/borrowings/:id                   # Delete borrowing record

# Queries
GET    /api/borrowings/active                # List active borrowings
GET    /api/borrowings/stats                 # Borrowing statistics
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure MongoDB:
- Make sure MongoDB is running
- Update connection string in `src/config/database.js` if needed

3. Start the server:
```bash
node src/app.js
```

4. Test the API:
```bash
chmod +x test_queries.sh
./test_queries.sh
```

## Testing

The `test_queries.sh` script provides comprehensive testing of all API endpoints. It:
1. Creates test members and books
2. Records borrowings
3. Tests all queries and aggregations
4. Performs cleanup

## Data Models

### Member
- name: String
- email: String
- membership_type: String
- join_year: Number

### Book
- title: String
- author: String
- genre: String
- year_published: Number

### Borrowing
- member_id: ObjectId
- book_id: ObjectId
- borrow_date: Date
- return_date: Date (nullable)

## Database Indexes

Optimized indexes are created for:
- Member queries by join year and membership type
- Book queries by title and popularity
- Borrowing queries by member, book, and return date

## Error Handling

The API includes comprehensive error handling for:
- Invalid ObjectIds
- Not found resources
- Database operation failures
- Validation errors

## Project Structure (MVC)

```
src/
├── config/
│   └── database.js      # Database connection configuration
├── models/
│   ├── Member.js        # Member model with CRUD and queries
│   ├── Book.js          # Book model with CRUD and queries
│   └── Borrowing.js     # Borrowing model with CRUD and queries
├── controllers/
│   ├── MemberController.js
│   ├── BookController.js
│   └── BorrowingController.js
├── routes/
│   ├── memberRoutes.js
│   ├── bookRoutes.js
│   └── borrowingRoutes.js
└── app.js               # Main application file
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas instance)

## Usage Examples

The `app.js` file contains example usage of all implemented features. You can modify it to test different scenarios or use the models directly in your own code.

## Database Structure

The system uses the following collections in the `library_db` database:

- `members`: Stores member information
- `books`: Stores book information
- `borrowings`: Tracks book borrowings

## Sample Data

The system automatically inserts:
- 5 sample members
- 3 sample books (including "Modern Egypt")
- Sample borrowing records

## Analytics

The system includes a basic analytics feature that shows the number of books borrowed per member. 