# library-management-system
Advanced Database Practical Project

## Setup Instructions

1. Clone the repository:
```bash
git clone git@github.com:tasbeehismail/library-management-system.git
cd library-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```bash
echo "MONGODB_URI='mongodb://localhost:27017/library_db'" > .env
```

4. Make sure MongoDB is running on your local machine

5. Start the server:
```bash
npm start
```
The server will run on http://localhost:6000

## Testing API Endpoints

Run the test script to verify all API endpoints:
```bash
bash test_queries.sh
```

## Project Structure

```
library-management-system/
├── src/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   └── app.js
├── test_queries.sh
├── package.json
└── .env
```

## Note

Make sure you have:
- Node.js installed 
- MongoDB installed and running
- `json_pp` command available (for formatted JSON output in tests)