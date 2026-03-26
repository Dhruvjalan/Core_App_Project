# Core App Backend

A Node.js/Express backend service for record discovery and user existence checks, backed by MongoDB. This API is designed to support the Core App frontend with lightweight authentication lookup and filtered data retrieval across multiple collections.

## Public Deployment

- **Backend (AWS EC2):** http://13.61.239.146:3000/
- **Frontend Repository:** https://github.com/Dhruvjalan/Core-app-frontend
- **Demo Video:** https://drive.google.com/file/d/1SUBR7g88A8HfmBhAYl5qPmWmlnayY-ws/view?usp=sharing

## Technology Stack

- Node.js (CommonJS)
- Express.js
- MongoDB + Mongoose
- CORS, dotenv

## Project Structure

```text
Core-app-backend/
├── src/
│   ├── app.js                       # Express app bootstrap and route registration
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   └── recordController.js      # Dynamic search logic
│   ├── routes/
│   │   ├── userroutes.js            # User existence endpoint
│   │   └── recordroutes.js          # Record search endpoint
│   ├── models/
│   │   ├── User.js
│   │   ├── E21Student.js
│   │   ├── E21Team.js
│   │   ├── IFStudent
│   │   ├── MeetupUser.js
│   │   └── TeamupParticipant.js
│   └── utils/
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=<your_mongodb_connection_string>
PORT=3000
```

### Install & Run

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

## Database Structure

The service uses MongoDB collections mapped via Mongoose models.

### 1) `user`
- `rollno` (String, required, unique)
- `name` (String, required)
- `vertical` (String)
- `access` (String, default: `user`)

### 2) `e21-students`
- `name` (String, required)
- `class` (Number)
- `phone` (Number, required)
- `formattedID` (String)
- `altPhone` (Number)
- `school` (String)
- `schoolLocation` (String)
- `email` (String, required)
- `creationTime` (Number)
- `lastUpdated` (Number)

### 3) `e21-teams`
- `teamName` (String, required)
- `email` (String, required)
- `leaderID` (String)
- `creationTime` (Number)
- `lastUpdated` (Number)

### 4) `if_students`
- `name` (String, required)
- `email` (String, required)
- `roll` (String)
- `phone` (Number)
- `department` (String)
- `degree` (String)
- `yearOfStudy` (Number)
- `cgpa` (Number)
- `address` (String)
- `personalEmail` (String)
- `iddd` (String)
- `pinCode` (Number)
- `allottedSSManager` (Object)
  - `name` (String)
  - `phone` (String)
- `preferredLocation` (String)
- `paymentDetails` (Object)
  - `captured` (Boolean, default: `false`)
- `skillTags` (String[])

### 5) `meetupusers`
- `firstName` (String, required)
- `lastName` (String)
- `email` (String, required)
- `phoneNumber` (Number)
- `linkedInID` (String)
- `definesYouBest` (String)
- `pincode` (Number)
- `startupName` (String)
- `industryName` (String)
- `startupWebsite` (String)
- `whereWillYouAttendMeetup` (String)
- `Isyourstartuprevenuegenerating` (String)
- `Isyourstartupbasedin` (String)
- `investinderOrNot` (String)

### 6) `teamupparticipants`
- `sourceInfoEvent` (String[])
- `isCoFounderMatchingRegistered` (Boolean, default: `false`)
- `cvUploaded` (Boolean, default: `false`)
- `name` (String, required)
- `email` (String, required)
- `phone` (Number)
- `roll` (String)
- `password` (String)
- `isOnlineBSc` (Boolean, default: `false`)
- `branch` (String)
- `degree` (String)
- `yearOfStudy` (Number)
- `isDD` (Boolean, default: `false`)

## API Documentation

Base URL: `http://13.61.239.146:3000`

### 1) Health Check

- **Method:** `GET`
- **Path:** `/`
- **Description:** Verifies backend availability.

**Example Response (200):**

```json
{
  "status": "success",
  "message": "Server is live! Hello World."
}
```

---

### 2) Check User by Roll Number

- **Method:** `GET`
- **Path:** `/api/check-user/:rollno`
- **Description:** Performs user existence lookup for login flows.
- **Path Param:**
  - `rollno` (string)

**Example Request:**

```http
GET /api/check-user/e21abc123
```

**Success Response (200):**

```json
{
  "exists": true,
  "message": "User found in database."
}
```

**Not Found (404):**

```json
{
  "exists": false,
  "message": "User does not exist."
}
```

---

### 3) Search Records

- **Method:** `POST`
- **Path:** `/api/records/search`
- **Description:** Executes filtered query against one selected collection.

#### Request Body

```json
{
  "dbName": "e21-students",
  "filters": {}
}
```

- `dbName` (string, required): one of
  - `e21-students`
  - `e21-teams`
  - `if_students`
  - `meetupusers`
  - `teamupparticipants`
- `filters` (object): key-value pairs matched against model fields.

#### Search Behavior

- Empty / null filter values are ignored.
- String fields are matched with case-insensitive partial regex.
- Number fields are converted to numeric values before query.
- Result set is limited to **50** records.

**Example Response (200):**

```json
[
  {
    "_id": "<mongo_object_id>",
    "name": "Sample User",
    "email": "sample@example.com"
  }
]
```

**Invalid Database (400):**

```json
{
  "message": "Invalid database selected"
}
```

**Server Error (500):**

```json
{
  "message": "Server error while searching records"
}
```

## Notes

- CORS is enabled for cross-origin frontend integration.
- API payloads and responses are JSON.
- For production use, ensure secure secret handling, input validation hardening, and proper data access controls.
