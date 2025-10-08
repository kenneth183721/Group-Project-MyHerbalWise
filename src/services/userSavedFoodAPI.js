// API service for user saved foods
const API_BASE_URL = '/api';

class UserSavedFoodAPI {
  // Get all saved foods for a user
  static async getUserSavedFoods(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-saved-foods/${userId}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved foods');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user saved foods:', error);
      throw error;
    }
  }

  // Get only the food IDs for a user (optimized for frontend state)
  static async getUserSavedFoodIds(userId) {
    try {
      // Validate userId parameter
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      const response = await fetch(`${API_BASE_URL}/user-saved-foods/${userId}/ids`);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 404) {
          // User has no saved foods, return empty array
          console.log('No saved foods found for user:', userId);
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Return the array of IDs directly, or empty array if no data
      return data.data || [];
    } catch (error) {
      // Check if it's a network error (fetch failed completely)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error - cannot reach backend server:', error);
        throw new Error('Cannot connect to server. Please check your internet connection and ensure the backend server is running.');
      }
      
      console.error('Error fetching user saved food IDs:', error);
      throw error;
    }
  }

  // Save a food for a user
  static async saveFood(userId, foodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-saved-foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userId,
          savedFoodID: foodId
        }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle duplicate entry case
        if (response.status === 409) {
          return { success: false, message: 'Food already saved', duplicate: true };
        }
        throw new Error(data.error || 'Failed to save food');
      }
      
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error saving food:', error);
      throw error;
    }
  }

  // Remove a saved food for a user
  static async unsaveFood(userId, foodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-saved-foods/${userId}/${foodId}`, {
        method: 'DELETE',
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, message: 'Food not found in saved list', notFound: true };
        }
        throw new Error(data.error || 'Failed to remove saved food');
      }
      
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error removing saved food:', error);
      throw error;
    }
  }

  // Check API health
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
}

export default UserSavedFoodAPI;
