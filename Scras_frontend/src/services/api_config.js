import axios from 'axios';

// Use port 3000 (your backend), NOT 3001
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout:300000, // 5 minutes timeout for long-running requests
    // ✅ DON'T set default Content-Type here
    // Let each request set its own Content-Type
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // ✅ Only set Content-Type for non-FormData requests
        if (config.data && !(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 - Token expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const token = localStorage.getItem('access_token');
        // Do NOT redirect if we are using the development bypass token
        if (error.response?.status === 401 && token !== 'mock-dev-token') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export { api, BASE_URL };
export default api;