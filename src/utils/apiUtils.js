// API utility functions
export const getApiBaseUrl = () => {
    // Use current hostname for API calls, fallback to localhost for development
    const hostname = window.location.hostname;
    const apiHost = hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname;
    return `http://${apiHost}:3001`;
};

export const getApiUrl = (endpoint) => {
    return `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

// Debug logging for mobile
export const logApiCall = (method, url, data = null) => {
    console.log(`🌐 API ${method.toUpperCase()}: ${url}`);
    if (data) {
        console.log('📤 Request data:', data);
    }
    console.log('🔧 Current hostname:', window.location.hostname);
    console.log('🔧 API base URL:', getApiBaseUrl());
};

export default { getApiBaseUrl, getApiUrl, logApiCall };
