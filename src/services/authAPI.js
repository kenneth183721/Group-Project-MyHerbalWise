// API service for authentication
const API_BASE_URL = '/api';

class AuthAPI {
  // User login
  static async login(email, password) {
    try {
      console.log('Making login request to:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get response text to understand what was returned
        let responseText = '';
        try {
          responseText = await response.text();
          console.log('Non-JSON response received:', responseText.substring(0, 200));
        } catch (textError) {
          console.error('Could not read response text:', textError);
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Expected JSON but got ${contentType || 'unknown content type'}`);
      }
      
      const data = await response.json();
      console.log('Parsed JSON data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      
      // Provide more helpful error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to the server. Please check your internet connection and ensure the backend server is running on port 3001.');
      }
      
      throw error;
    }
  }

  // Generate verification code for password reset
  static async generateVerificationCode(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/generate-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate verification code');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating verification code:', error);
      throw error;
    }
  }

  // Reset password with verification code
  static async resetPassword(email, verificationCode, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode, newPassword }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Forgot password (legacy method)
  static async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process forgot password request');
      }
      
      return data;
    } catch (error) {
      console.error('Error during forgot password:', error);
      throw error;
    }
  }
}

export default AuthAPI;
