// Simple test to check API connectivity
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint:');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    // Test login endpoint
    console.log('\n2. Testing login endpoint:');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'joechan@gmail.com', 
        password: '24680' 
      }),
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers));
    
    const loginData = await loginResponse.json();
    console.log('Login response data:', loginData);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
