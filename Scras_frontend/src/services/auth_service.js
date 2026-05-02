import api from './api_config';

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });

        if (response.data?.success && response.data?.data) {
            const { token, user } = response.data.data;
            localStorage.setItem('access_token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true, token, user };
        }
        
        return { success: false, message: 'Invalid response from server' };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Login failed'
        };
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getUserRole = () => {
    const user = getCurrentUser();
    return user?.role?.toLowerCase() || null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

export default { login, logout, getCurrentUser, getUserRole, isAuthenticated };