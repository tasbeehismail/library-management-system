# Base URL
BASE_URL="http://localhost:6000/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Library Management System API Tests ===${NC}"
echo "=========================================="

# 1. CRUD Operations for Members
echo -e "\n${GREEN}1. CRUD Operations for Members${NC}"
echo "--------------------------------"

# Insert member
echo -e "\n${BLUE}Creating members:${NC}"
MEMBER_RESPONSE=$(curl -s -X POST "$BASE_URL/members" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ahmed Mohammed", "age": "30", "membership_type": "premium", "join_year": 2025}')
echo "Member 1: $MEMBER_RESPONSE"

# Extract member ID for later use
MEMBER_ID=$(echo $MEMBER_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "Using member ID: $MEMBER_ID"

# Update a member
echo -e "\n${BLUE}Updating a member:${NC}"
curl -s -X PUT "$BASE_URL/members/$MEMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ahmed Updated", "membership_type": "new"}'

# 2. CRUD Operations for Books
echo -e "\n${GREEN}2. CRUD Operations for Books${NC}"
echo "-----------------------------"

# Create books
echo -e "\n${BLUE}Creating books:${NC}"
BOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/books" \
  -H "Content-Type: application/json" \
  -d '{"title": "Modern Egypt", "author": "Ahmed Ismail", "genre": "History", "year_published": 2020}')
echo "Book 1: $BOOK_RESPONSE"

# Extract book ID for later use
BOOK_ID=$(echo $BOOK_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "Using book ID: $BOOK_ID"

# Update a book
echo -e "\n${BLUE}Updating a book:${NC}"
curl -s -X PUT "$BASE_URL/books/$BOOK_ID" \
  -H "Content-Type: application/json" \
  -d '{"title": "Modern Egypt - Revised Edition"}'


# 3. Borrowing Operations
echo -e "\n${GREEN}3. Borrowing Operations${NC}"
echo "------------------------"

# Record a borrowing
echo -e "\n${BLUE}Recording a borrowing:${NC}"
BORROWING_RESPONSE=$(curl -s -X POST "$BASE_URL/borrowings" \
  -H "Content-Type: application/json" \
  -d "{\"member_id\": \"$MEMBER_ID\", \"book_id\": \"$BOOK_ID\", \"borrow_date\": \"2024-01-01\"}")
echo "$BORROWING_RESPONSE"

# Extract borrowing ID
BORROWING_ID=$(echo $BORROWING_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "\nUsing borrowing ID: $BORROWING_ID"

# Update return date
echo -e "\n${BLUE}Updating return date:${NC}"
curl -s -X PUT "$BASE_URL/borrowings/$BORROWING_ID/return" \
  -H "Content-Type: application/json" \
  -d '{"return_date": "2024-01-15"}'

# 4. Queries (Find & Filter)
echo -e "\n${GREEN}4. Queries (Find & Filter)${NC}"
echo "---------------------------"

# List members who borrowed specific book
echo -e "\n${BLUE}Members who borrowed specific book:${NC}"
curl -s "$BASE_URL/books/$BOOK_ID/borrowers" | json_pp 

# Find members who joined before 2020
echo -e "\n${BLUE}Members who joined before 2020:${NC}"
curl -s "$BASE_URL/members/join-year/2020" | json_pp

# Books borrowed by more than 2 members
echo -e "\n${BLUE}Books borrowed by more than 2 members:${NC}"
curl -s "$BASE_URL/books/popular?minBorrowers=2" | json_pp

# Books borrowed by a specific member
echo -e "\n${BLUE}Books borrowed by member:${NC}"
curl -s "$BASE_URL/members/$MEMBER_ID/books" | json_pp

# 5. Aggregation Queries
echo -e "\n${GREEN}5. Aggregation Queries${NC}"
echo "----------------------"

# Count total books borrowed per member
echo -e "\n${BLUE}Total books borrowed per member:${NC}"
curl -s "$BASE_URL/members/borrowing-counts" | json_pp

# Average books borrowed per membership type
echo -e "\n${BLUE}Average books borrowed per membership type:${NC}"
curl -s "$BASE_URL/members/stats/avg-books" | json_pp

# Members who borrowed more than X books
echo -e "\n${BLUE}Members who borrowed more than 2 books:${NC}"
curl -s "$BASE_URL/members/stats/borrowed-more-than/2" | json_pp

# Members grouped by membership type
echo -e "\n${BLUE}Members grouped by membership type:${NC}"
curl -s "$BASE_URL/members/stats/membership-types" | json_pp


# 6. Deleting Operations

# Delete a member (with cascade delete of borrowings)
echo -e "\n${BLUE}Deleting a member:${NC}"
curl -s -X DELETE "$BASE_URL/members/$MEMBER_ID"

# Delete a book
echo -e "\n${BLUE}Deleting a book:${NC}"
curl -s -X DELETE "$BASE_URL/books/$BOOK_ID"