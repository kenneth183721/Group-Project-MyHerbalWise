const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to JSON files
const USER_SAVED_FOOD_PATH = path.join(__dirname, 'src', 'json', 'userSavedFood.json');
const USER_PATH = path.join(__dirname, 'src', 'json', 'user.json');
const DIETARY_RECORD_PATH = path.join(__dirname, 'src', 'json', 'dietaryRecord.json');

// Helper function to read JSON file
const readJSONFile = async (filePath) => {
  try {
    const data = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper function to write JSON file
const writeJSONFile = async (filePath, data) => {
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// API Routes

// GET: Get all saved foods for a specific user
app.get('/api/user-saved-foods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const savedFoods = await readJSONFile(USER_SAVED_FOOD_PATH);
    const userSavedFoods = savedFoods.filter(item => item.userID === userId);
    
    res.json({
      success: true,
      data: userSavedFoods,
      count: userSavedFoods.length
    });
    
  } catch (error) {
    console.error('Error fetching user saved foods:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Save a food for a user
app.post('/api/user-saved-foods', async (req, res) => {
  try {
    const { userID, savedFoodID } = req.body;
    
    if (!userID || !savedFoodID) {
      return res.status(400).json({ 
        error: 'userID and savedFoodID are required' 
      });
    }

    const savedFoods = await readJSONFile(USER_SAVED_FOOD_PATH);
    
    // Check if already saved
    const existingEntry = savedFoods.find(
      item => item.userID === userID && item.savedFoodID === savedFoodID
    );
    
    if (existingEntry) {
      return res.status(409).json({ 
        error: 'Food already saved by this user',
        data: existingEntry
      });
    }

    // Add new saved food entry
    const newSavedFood = {
      userID,
      savedFoodID,
      savedAt: new Date().toISOString()
    };
    
    savedFoods.push(newSavedFood);
    
    const success = await writeJSONFile(USER_SAVED_FOOD_PATH, savedFoods);
    
    if (success) {
      res.status(201).json({
        success: true,
        message: 'Food saved successfully',
        data: newSavedFood
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to save food' 
      });
    }
    
  } catch (error) {
    console.error('Error saving food:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// DELETE: Remove a saved food for a user
app.delete('/api/user-saved-foods/:userId/:foodId', async (req, res) => {
  try {
    const { userId, foodId } = req.params;
    
    if (!userId || !foodId) {
      return res.status(400).json({ 
        error: 'User ID and Food ID are required' 
      });
    }

    const savedFoods = await readJSONFile(USER_SAVED_FOOD_PATH);
    
    // Find the entry to remove
    const entryIndex = savedFoods.findIndex(
      item => item.userID === userId && item.savedFoodID === foodId
    );
    
    if (entryIndex === -1) {
      return res.status(404).json({ 
        error: 'Saved food entry not found' 
      });
    }

    // Remove the entry
    const removedEntry = savedFoods.splice(entryIndex, 1)[0];
    
    const success = await writeJSONFile(USER_SAVED_FOOD_PATH, savedFoods);
    
    if (success) {
      res.json({
        success: true,
        message: 'Food removed from saved list',
        data: removedEntry
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to remove saved food' 
      });
    }
    
  } catch (error) {
    console.error('Error removing saved food:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET: Get saved food IDs only for a specific user (optimized for frontend)
app.get('/api/user-saved-foods/:userId/ids', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const savedFoods = await readJSONFile(USER_SAVED_FOOD_PATH);
    const userSavedFoodIds = savedFoods
      .filter(item => item.userID === userId)
      .map(item => item.savedFoodID);
    
    res.json({
      success: true,
      data: userSavedFoodIds,
      count: userSavedFoodIds.length
    });
    
  } catch (error) {
    console.error('Error fetching user saved food IDs:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'User Saved Foods API is running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!' 
  });
});

// POST: User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: User registration/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      gender, 
      age 
    } = req.body;
    
    // Validation
    if (!username || !email || !password || !firstName || !lastName || !gender || !age) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address' 
      });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Age validation
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ 
        error: 'Please enter a valid age between 1 and 120' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    
    // Check if email already exists
    const existingEmailUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmailUser) {
      return res.status(409).json({ 
        error: 'Email address is already registered' 
      });
    }
    
    // Check if username already exists
    const existingUsernameUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUsernameUser) {
      return res.status(409).json({ 
        error: 'Username is already taken' 
      });
    }

    // Generate new user ID
    const maxId = Math.max(...users.map(u => parseInt(u.userID.replace('uid', '')) || 0));
    const newUserId = `uid${String(maxId + 1).padStart(2, '0')}`;
    
    // Create new user object
    const newUser = {
      userID: newUserId,
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In production, this should be hashed
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender.toLowerCase(),
      age: ageNum,
      bodyTypeRecordID: null,
      bodyTypeRecordDate: null,
      healthStatusRecordID: [],
      dietaryRecordID: [],
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      notificationHealth: true,
      notificationDiet: true,
      constitution: null,
      bodyType: null,
      bodyTypeName: null,
      testResult: null
    };

    // Add new user to array
    users.push(newUser);

    // Save to file
    await writeJSONFile(USER_PATH, users);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Generate verification code for password reset
app.post('/api/auth/generate-verification-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Expires in 10 minutes
    
    // Add verification code to user record
    users[userIndex].verificationCode = verificationCode;
    users[userIndex].verificationCodeExpireAt = expireAt;
    users[userIndex].updateAt = new Date().toISOString();
    
    const success = await writeJSONFile(USER_PATH, users);
    
    if (!success) {
      return res.status(500).json({ 
        error: 'Failed to generate verification code' 
      });
    }

    res.json({
      success: true,
      message: 'Verification code generated',
      data: {
        email: users[userIndex].email,
        verificationCode: verificationCode, // In real app, this would be sent via email
        expiresIn: '10 minutes'
      }
    });
    
  } catch (error) {
    console.error('Error generating verification code:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Reset password with verification code
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    
    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ 
        error: 'Email, verification code, and new password are required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }

    const user = users[userIndex];
    
    // Check if verification code exists and is valid
    if (!user.verificationCode) {
      return res.status(400).json({ 
        error: 'No verification code found. Please generate a new one.' 
      });
    }
    
    // Check if verification code matches
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ 
        error: 'Invalid verification code' 
      });
    }
    
    // Check if verification code has expired
    if (new Date() > new Date(user.verificationCodeExpireAt)) {
      return res.status(400).json({ 
        error: 'Verification code has expired. Please generate a new one.' 
      });
    }
    
    // Update password and clean up verification code
    users[userIndex].password = newPassword;
    users[userIndex].updateAt = new Date().toISOString();
    delete users[userIndex].verificationCode;
    delete users[userIndex].verificationCodeExpireAt;
    
    const success = await writeJSONFile(USER_PATH, users);
    
    if (!success) {
      return res.status(500).json({ 
        error: 'Failed to reset password' 
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: users[userIndex].email,
        username: users[userIndex].username
      }
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Forgot password (get user info by email) - LEGACY, kept for compatibility
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }

    // In a real app, you would send an email here
    // For demo purposes, we'll return some user info and password hint
    res.json({
      success: true,
      message: 'Password hint sent',
      data: {
        email: user.email,
        username: user.username,
        passwordHint: `Password starts with: ${user.password.substring(0, 2)}****`
      }
    });
    
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PUT: Update user information
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    console.log('PUT /api/users/:userId called with:', { userId, updateData });
    
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    console.log('Users loaded:', users ? users.length : 'null');
    
    const userIndex = users.findIndex(user => user.userID === userId);
    console.log('User index found:', userIndex);
    
    if (userIndex === -1) {
      console.error('User not found:', userId);
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      updateAt: new Date().toISOString()
    };
    
    console.log('Updated user data:', updatedUser);
    users[userIndex] = updatedUser;
    
    const success = await writeJSONFile(USER_PATH, users);
    console.log('Write success:', success);
    
    if (!success) {
      console.error('Failed to write JSON file');
      return res.status(500).json({ 
        error: 'Failed to update user' 
      });
    }

    const response = {
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    };
    
    console.log('Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('Error updating user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// GET: Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const users = await readJSONFile(USER_PATH);
    const user = users.find(user => user.userID === userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ============ DIETARY RECORDS API ENDPOINTS ============

// GET: Get all dietary records for a specific user
app.get('/api/dietary-records/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const allRecords = await readJSONFile(DIETARY_RECORD_PATH);
    const userRecords = allRecords.filter(record => record.userID === userId);
    
    // Sort by date and time (newest first)
    userRecords.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB - dateTimeA;
    });

    res.json({
      success: true,
      data: userRecords
    });
    
  } catch (error) {
    console.error('Error fetching dietary records:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET: Get a specific dietary record by ID
app.get('/api/dietary-records/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    const allRecords = await readJSONFile(DIETARY_RECORD_PATH);
    const record = allRecords.find(record => record.recordID === recordId);
    
    if (!record) {
      return res.status(404).json({ 
        error: 'Dietary record not found' 
      });
    }

    res.json({
      success: true,
      data: record
    });
    
  } catch (error) {
    console.error('Error fetching dietary record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Create a new dietary record
app.post('/api/dietary-records', async (req, res) => {
  try {
    const { userID, date, time, foodItems, portions, mealType, notes } = req.body;
    
    // Validation
    if (!userID || !date || !time || !foodItems || !portions) {
      return res.status(400).json({ 
        error: 'Required fields: userID, date, time, foodItems, portions' 
      });
    }

    const allRecords = await readJSONFile(DIETARY_RECORD_PATH);
    
    // Generate unique record ID
    const timestamp = Date.now();
    const recordID = `dr${timestamp}`;
    
    const newRecord = {
      recordID,
      userID,
      date,
      time,
      foodItems: foodItems.trim(),
      portions: portions.trim(),
      mealType: mealType || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    allRecords.push(newRecord);
    
    const success = await writeJSONFile(DIETARY_RECORD_PATH, allRecords);
    
    if (!success) {
      return res.status(500).json({ 
        error: 'Failed to save dietary record' 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Dietary record created successfully',
      data: newRecord
    });
    
  } catch (error) {
    console.error('Error creating dietary record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PUT: Update an existing dietary record
app.put('/api/dietary-records/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { date, time, foodItems, portions, mealType, notes } = req.body;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    // Validation
    if (!date || !time || !foodItems || !portions) {
      return res.status(400).json({ 
        error: 'Required fields: date, time, foodItems, portions' 
      });
    }

    const allRecords = await readJSONFile(DIETARY_RECORD_PATH);
    const recordIndex = allRecords.findIndex(record => record.recordID === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ 
        error: 'Dietary record not found' 
      });
    }

    // Update the record
    allRecords[recordIndex] = {
      ...allRecords[recordIndex],
      date,
      time,
      foodItems: foodItems.trim(),
      portions: portions.trim(),
      mealType: mealType || '',
      notes: notes || '',
      updatedAt: new Date().toISOString()
    };

    const success = await writeJSONFile(DIETARY_RECORD_PATH, allRecords);
    
    if (!success) {
      return res.status(500).json({ 
        error: 'Failed to update dietary record' 
      });
    }

    res.json({
      success: true,
      message: 'Dietary record updated successfully',
      data: allRecords[recordIndex]
    });
    
  } catch (error) {
    console.error('Error updating dietary record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// DELETE: Delete a dietary record
app.delete('/api/dietary-records/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    const allRecords = await readJSONFile(DIETARY_RECORD_PATH);
    const recordIndex = allRecords.findIndex(record => record.recordID === recordId);
    
    if (recordIndex === -1) {
      return res.status(404).json({ 
        error: 'Dietary record not found' 
      });
    }

    // Remove the record
    const deletedRecord = allRecords.splice(recordIndex, 1)[0];
    
    const success = await writeJSONFile(DIETARY_RECORD_PATH, allRecords);
    
    if (!success) {
      return res.status(500).json({ 
        error: 'Failed to delete dietary record' 
      });
    }

    res.json({
      success: true,
      message: 'Dietary record deleted successfully',
      data: deletedRecord
    });
    
  } catch (error) {
    console.error('Error deleting dietary record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ============ HEALTH STATUS RECORDS API ENDPOINTS ============

// Path to health status records JSON file
const HEALTH_STATUS_RECORD_PATH = path.join(__dirname, 'src', 'json', 'healthStatusRecord.json');

// GET: Get all health status records for a user
app.get('/api/healthStatusRecord/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const records = await readJSONFile(HEALTH_STATUS_RECORD_PATH);
    const userRecords = records.filter(record => record.userId === userId);
    
    res.json({
      success: true,
      data: userRecords
    });
    
  } catch (error) {
    console.error('Error fetching health status records:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// GET: Get specific health status record by ID
app.get('/api/healthStatusRecord/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    const records = await readJSONFile(HEALTH_STATUS_RECORD_PATH);
    const record = records.find(r => r.id === parseInt(recordId));
    
    if (!record) {
      return res.status(404).json({ 
        error: 'Health status record not found' 
      });
    }
    
    res.json({
      success: true,
      data: record
    });
    
  } catch (error) {
    console.error('Error fetching health status record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// POST: Create new health status record
app.post('/api/healthStatusRecord', async (req, res) => {
  try {
    const {
      userId,
      userName,
      healthStatusID,
      healthStatusName,
      date,
      symptoms,
      notes,
      severity
    } = req.body;

    // Validate required fields
    if (!userId || !healthStatusID || !healthStatusName || !date || !symptoms) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, healthStatusID, healthStatusName, date, symptoms' 
      });
    }

    const records = await readJSONFile(HEALTH_STATUS_RECORD_PATH);
    
    // Generate new record ID
    const maxId = Math.max(...records.map(r => r.id || 0), 0);
    const newRecordId = maxId + 1;
    
    // Create new health status record
    const newRecord = {
      id: newRecordId,
      userId: userId,
      userName: userName || '',
      healthStatusID: healthStatusID,
      healthStatusName: healthStatusName,
      date: date,
      symptoms: symptoms.trim(),
      notes: notes ? notes.trim() : '',
      severity: severity || '輕微',
      timestamp: new Date().toISOString()
    };

    // Add new record to array
    records.push(newRecord);

    // Save to file
    await writeJSONFile(HEALTH_STATUS_RECORD_PATH, records);

    // Update user's health status record IDs
    try {
      const users = await readJSONFile(USER_PATH);
      const userIndex = users.findIndex(u => u.userID === userId);
      if (userIndex !== -1) {
        if (!users[userIndex].healthStatusRecordID) {
          users[userIndex].healthStatusRecordID = [];
        }
        users[userIndex].healthStatusRecordID.push(newRecordId);
        users[userIndex].updateAt = new Date().toISOString();
        await writeJSONFile(USER_PATH, users);
      }
    } catch (userError) {
      console.error('Error updating user health status records:', userError);
      // Continue anyway - the record was created successfully
    }

    res.status(201).json({
      success: true,
      message: 'Health status record created successfully',
      data: newRecord
    });
    
  } catch (error) {
    console.error('Error creating health status record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// PUT: Update health status record
app.put('/api/healthStatusRecord/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    const records = await readJSONFile(HEALTH_STATUS_RECORD_PATH);
    const recordIndex = records.findIndex(r => r.id === parseInt(recordId));
    
    if (recordIndex === -1) {
      return res.status(404).json({ 
        error: 'Health status record not found' 
      });
    }

    // Update record with new data, preserving original fields
    const updatedRecord = {
      ...records[recordIndex],
      ...updateData,
      id: parseInt(recordId), // Ensure ID doesn't change
      timestamp: new Date().toISOString() // Update timestamp
    };
    
    records[recordIndex] = updatedRecord;
    
    // Save to file
    await writeJSONFile(HEALTH_STATUS_RECORD_PATH, records);

    res.json({
      success: true,
      message: 'Health status record updated successfully',
      data: updatedRecord
    });
    
  } catch (error) {
    console.error('Error updating health status record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// DELETE: Delete health status record
app.delete('/api/healthStatusRecord/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!recordId) {
      return res.status(400).json({ 
        error: 'Record ID is required' 
      });
    }

    const records = await readJSONFile(HEALTH_STATUS_RECORD_PATH);
    const recordIndex = records.findIndex(r => r.id === parseInt(recordId));
    
    if (recordIndex === -1) {
      return res.status(404).json({ 
        error: 'Health status record not found' 
      });
    }

    // Get the record to be deleted for response
    const deletedRecord = records[recordIndex];
    
    // Remove record from array
    records.splice(recordIndex, 1);
    
    // Save to file
    await writeJSONFile(HEALTH_STATUS_RECORD_PATH, records);

    // Update user's health status record IDs
    try {
      const users = await readJSONFile(USER_PATH);
      const userIndex = users.findIndex(u => u.userID === deletedRecord.userId);
      if (userIndex !== -1 && users[userIndex].healthStatusRecordID) {
        users[userIndex].healthStatusRecordID = users[userIndex].healthStatusRecordID.filter(
          id => id !== parseInt(recordId)
        );
        users[userIndex].updateAt = new Date().toISOString();
        await writeJSONFile(USER_PATH, users);
      }
    } catch (userError) {
      console.error('Error updating user health status records:', userError);
      // Continue anyway - the record was deleted successfully
    }

    res.json({
      success: true,
      message: 'Health status record deleted successfully',
      data: deletedRecord
    });
    
  } catch (error) {
    console.error('Error deleting health status record:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 User Saved Foods API server is running on port ${PORT}`);
  console.log(`🌐 Server accessible at:`);
  console.log(`   - Local: http://localhost:${PORT}`);
  console.log(`   - Network: http://192.168.2.33:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET    /api/health`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/signup`);
  console.log(`   POST   /api/auth/generate-verification-code`);
  console.log(`   POST   /api/auth/reset-password`);
  console.log(`   POST   /api/auth/forgot-password`);
  console.log(`   GET    /api/users/:userId`);
  console.log(`   PUT    /api/users/:userId`);
  console.log(`   GET    /api/user-saved-foods/:userId`);
  console.log(`   GET    /api/user-saved-foods/:userId/ids`);
  console.log(`   POST   /api/user-saved-foods`);
  console.log(`   DELETE /api/user-saved-foods/:userId/:foodId`);
  console.log(`   POST   /api/push/subscribe`);
  console.log(`   POST   /api/push/unsubscribe`);
  console.log(`   POST   /api/push/send`);
  console.log(`   GET    /api/push/subscriptions`);
  console.log(`📱 Push notifications enabled with VAPID keys`);
  console.log(`   GET    /api/dietary-records/:userId`);
  console.log(`   GET    /api/dietary-records/record/:recordId`);
  console.log(`   POST   /api/dietary-records`);
  console.log(`   PUT    /api/dietary-records/:recordId`);
  console.log(`   DELETE /api/dietary-records/:recordId`);
  console.log(`   GET    /api/healthStatusRecord/:userId`);
  console.log(`   GET    /api/healthStatusRecord/record/:recordId`);
  console.log(`   POST   /api/healthStatusRecord`);
  console.log(`   PUT    /api/healthStatusRecord/:recordId`);
  console.log(`   DELETE /api/healthStatusRecord/:recordId`);
});

module.exports = app;
