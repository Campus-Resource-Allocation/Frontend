import React, { useState, useEffect } from 'react';
import { login } from '../../services/auth_service';
import '../../styles/admin.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [theme, setTheme] = useState('dark'); // Default to Dark as per user preference

    // Toggle Theme Logic
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success && result.user.role === 'admin') {
            onLoginSuccess(result.user);
        } else if (result.success) {
            setError('Access Denied: Only Admins can access this portal.');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-container">
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="admin-glass-card">
                <div className="admin-logo" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{
                        background: 'var(--admin-accent)',
                        borderRadius: '12px',
                        width: '44px',
                        height: '44px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
                    }}>
                        🛡️
                    </span>
                </div>
                
                <h2>Admin Portal</h2>
                <p className="admin-subtitle">Secure access for system administrators</p>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>ADMIN EMAIL</label>
                        <input
                            type="email"
                            placeholder="admin@resora.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message" style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="admin-submit-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', opacity: 0.6, color: 'var(--admin-text)' }}>
                    © 2026 RESORA System · v2.5.0
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
