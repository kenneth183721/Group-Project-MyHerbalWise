// API service for user operations
const API_BASE_URL = '/api';

class UserAPI {
  // Get user by ID
  static async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user information
  static async updateUser(userId, userData) {
    try {
      console.log('UserAPI.updateUser called with:', { userId, userData });
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error(`Server returned ${response.status}: ${response.statusText} (${responseText})`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        const errorMessage = (data && data.error) ? data.error : 'Failed to update user';
        console.error('Server error response:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  // Update user account settings
  static async updateAccountSettings(userId, accountData) {
    const updateData = {
      email: accountData.email,
      notificationHealth: accountData.notificationHealth,
      notificationDiet: accountData.notificationDiet
    };
    
    // Only include password if newPassword is provided
    if (accountData.newPassword && accountData.newPassword.trim() !== '') {
      updateData.password = accountData.newPassword;
    }
    
    return this.updateUser(userId, updateData);
  }

  // Verify current password
  static async verifyPassword(userId, currentPassword) {
    try {
      const userResponse = await this.getUser(userId);
      const user = userResponse.data;
      
      return user.password === currentPassword;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Update user basic information
  static async updateBasicInfo(userId, basicData) {
    const updateData = {
      firstName: basicData.firstName,
      lastName: basicData.lastName,
      gender: basicData.gender
    };
    
    return this.updateUser(userId, updateData);
  }
}

export default UserAPI;
