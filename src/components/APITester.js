import React, { useState } from 'react';

function APITester() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testAPI = async () => {
    try {
      setResult('Testing...');
      setError('');
      
      const API_BASE_URL = 'http://localhost:3001/api';
      console.log('Testing API at:', `${API_BASE_URL}/health`);
      
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('Response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        setError(`Non-JSON response: ${text.substring(0, 200)}`);
        return;
      }
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
    } catch (err) {
      console.error('Test error:', err);
      setError(err.message);
    }
  };

  const testLogin = async () => {
    try {
      setResult('Testing login...');
      setError('');
      
      const API_BASE_URL = 'http://localhost:3001/api';
      console.log('Testing login at:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'joechan@gmail.com', 
          password: '24680' 
        }),
      });
      
      console.log('Login response:', response);
      console.log('Login response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        setError(`Non-JSON response: ${text.substring(0, 200)}`);
        return;
      }
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
    } catch (err) {
      console.error('Login test error:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>API Tester</h3>
      <button onClick={testAPI} style={{ marginRight: '10px' }}>Test Health</button>
      <button onClick={testLogin}>Test Login</button>
      
      {error && (
        <div style={{ marginTop: '20px', color: 'red', background: '#ffeaea', padding: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
          <strong>Result:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default APITester;
