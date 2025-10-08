import { getApiBaseUrl } from '../utils/apiUtils';

// API service for dietary records
const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://your-production-api.com';
    }
    return getApiBaseUrl(); // Use dynamic API base URL
};

class DietaryRecordAPI {
    // Get all dietary records for a specific user
    static async getDietaryRecords(userID) {
        try {
            const API_BASE_URL = getApiUrl();
            const response = await fetch(`${API_BASE_URL}/api/dietary-records/${userID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching dietary records:', error);
            throw error;
        }
    }

    // Get a specific dietary record by ID
    static async getDietaryRecord(recordID) {
        try {
            const API_BASE_URL = getApiUrl();
            const response = await fetch(`${API_BASE_URL}/api/dietary-records/record/${recordID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching dietary record:', error);
            throw error;
        }
    }

    // Create a new dietary record
    static async createDietaryRecord(recordData) {
        try {
            const API_BASE_URL = getApiUrl();
            const response = await fetch(`${API_BASE_URL}/api/dietary-records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating dietary record:', error);
            throw error;
        }
    }

    // Update an existing dietary record
    static async updateDietaryRecord(recordID, recordData) {
        try {
            const API_BASE_URL = getApiUrl();
            const response = await fetch(`${API_BASE_URL}/api/dietary-records/${recordID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating dietary record:', error);
            throw error;
        }
    }

    // Delete a dietary record
    static async deleteDietaryRecord(recordID) {
        try {
            const API_BASE_URL = getApiUrl();
            const response = await fetch(`${API_BASE_URL}/api/dietary-records/${recordID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting dietary record:', error);
            throw error;
        }
    }
}

export default DietaryRecordAPI;