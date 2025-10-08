# User Saved Foods API

This document describes the Express.js API for managing user saved foods functionality.

## Quick Start

### 1. Install Dependencies
```bash
# Install cors if not already installed
npm install cors

# Optional: Install concurrently for running both frontend and backend
npm install --save-dev concurrently
```

### 2. Start the API Server
```bash
# Start only the API server
npm run server

# OR start both frontend and backend together
npm run dev
```

The API server will run on `http://localhost:3000`

## API Endpoints

### 🔍 Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-19T10:30:00.000Z",
  "message": "User Saved Foods API is running"
}
```

### 👤 Get User Saved Foods
```http
GET /api/user-saved-foods/:userId
```
**Example:** `GET /api/user-saved-foods/uid01`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userID": "uid01",
      "savedFoodID": "food01",
      "savedAt": "2025-09-19T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 🆔 Get User Saved Food IDs Only
```http
GET /api/user-saved-foods/:userId/ids
```
**Example:** `GET /api/user-saved-foods/uid01/ids`

**Response:**
```json
{
  "success": true,
  "data": ["food01", "food02", "food03"],
  "count": 3
}
```

### ➕ Save Food for User
```http
POST /api/user-saved-foods
Content-Type: application/json

{
  "userID": "uid01",
  "savedFoodID": "food01"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Food saved successfully",
  "data": {
    "userID": "uid01",
    "savedFoodID": "food01",
    "savedAt": "2025-09-19T10:30:00Z"
  }
}
```

**Duplicate Response (409):**
```json
{
  "error": "Food already saved by this user",
  "data": {
    "userID": "uid01",
    "savedFoodID": "food01",
    "savedAt": "2025-09-19T10:30:00Z"
  }
}
```

### ❌ Remove Saved Food
```http
DELETE /api/user-saved-foods/:userId/:foodId
```
**Example:** `DELETE /api/user-saved-foods/uid01/food01`

**Response:**
```json
{
  "success": true,
  "message": "Food removed from saved list",
  "data": {
    "userID": "uid01",
    "savedFoodID": "food01",
    "savedAt": "2025-09-19T10:30:00Z"
  }
}
```

## Frontend Integration

The frontend automatically uses the API through the `UserSavedFoodAPI` service class.

### Key Features:
- ✅ **Automatic API calls** when saving/unsaving foods
- ✅ **Error handling** with user-friendly messages
- ✅ **Fallback support** if API is unavailable
- ✅ **Real-time updates** in UI
- ✅ **Login status checking**

### Components Updated:
- `src/components/foodDB.js` - Main food database
- `src/components/landing/recomFood.js` - Homepage recommendations

## File Structure
```
├── server.js                           # Express.js API server
├── src/
│   ├── services/
│   │   └── userSavedFoodAPI.js         # Frontend API service
│   ├── components/
│   │   ├── foodDB.js                   # Updated to use API
│   │   └── landing/
│   │       └── recomFood.js            # Updated to use API
│   └── json/
│       └── userSavedFood.json          # Data storage file
└── package.json                        # Updated with server scripts
```

## Data Flow

1. **User clicks save/unsave button**
2. **Frontend calls UserSavedFoodAPI methods**
3. **API processes request and updates userSavedFood.json**
4. **Frontend receives response and updates UI**
5. **User sees immediate visual feedback**

## Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:3001/api/health

# Get saved foods for user
curl http://localhost:3001/api/user-saved-foods/uid01

# Save a food
curl -X POST http://localhost:3001/api/user-saved-foods \
  -H "Content-Type: application/json" \
  -d '{"userID": "uid01", "savedFoodID": "food01"}'

# Remove a saved food
curl -X DELETE http://localhost:3001/api/user-saved-foods/uid01/food01
```

### Using the UI:
1. Start both frontend and backend: `npm run dev`
2. Navigate to the food database or homepage
3. Click the save/unsave buttons on food cards
4. Check the console for API calls and responses

## Error Handling

The API includes comprehensive error handling:
- ✅ **400** - Bad Request (missing parameters)
- ✅ **404** - Not Found (food not in saved list)
- ✅ **409** - Conflict (duplicate save attempt)
- ✅ **500** - Internal Server Error

Frontend gracefully handles all error cases with appropriate user messages.

## Development Notes

- **Mock User**: Currently uses `uid01` as the logged-in user
- **CORS**: Enabled for frontend-backend communication
- **File-based Storage**: Uses JSON file for simplicity
- **Real-time Updates**: UI updates immediately on API success
- **Backward Compatibility**: Falls back gracefully if API is unavailable
