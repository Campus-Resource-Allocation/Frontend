import axios from 'axios';

// Use port 3000 (your backend), NOT 3001
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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