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
        
        // Fallback for demo accounts if backend is not yet populated
        if (email === '24l0601@lhr.nu.edu.pk' || email === 'ta.sana@nu.edu.pk' || email === 'hina.i@university.edu') {
            console.warn('Backend login failed. Using development bypass for demo account.');
            const mockUser = {
                id: 999,
                email: email,
                name: 'Demo User',
                role: email.includes('24l') ? 'Student' : email.includes('ta') ? 'TA' : 'Teacher',
                reference_id: 1
            };
            localStorage.setItem('access_token', 'mock-dev-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { success: true, token: 'mock-dev-token', user: mockUser };
        }

        return { success: false, message: 'Invalid response from server' };
    } catch (error) {
        // Fallback for demo accounts if backend is unreachable
        if (email === '24l0601@lhr.nu.edu.pk' || email === 'ta.sana@nu.edu.pk' || email === 'hina.i@university.edu') {
            console.warn('Backend unreachable. Using development bypass for demo account.');
            const mockUser = {
                id: 999,
                email: email,
                name: 'Demo User',
                role: email.includes('24l') ? 'Student' : email.includes('ta') ? 'TA' : 'Teacher',
                reference_id: 1
            };
            localStorage.setItem('access_token', 'mock-dev-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { success: true, token: 'mock-dev-token', user: mockUser };
        }

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