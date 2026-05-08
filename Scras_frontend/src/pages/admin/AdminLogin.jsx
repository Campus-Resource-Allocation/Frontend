import React, { useState } from 'react';
import { login } from '../../services/auth_service';
import styles from './AdminLogin.module.css';

const AdminLogin = ({ onLoginSuccess, theme, toggleTheme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success && result.user?.role?.toLowerCase() === 'admin') {
            localStorage.setItem('access_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            onLoginSuccess(result.user);
        } else if (result.success) {
            setError('Access Denied: Only Admins can access this portal.');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className={styles.glassCard}>
                <div className={styles.logoWrapper}>
                    <span className={styles.logo}>
                        🛡️
                    </span>
                </div>
                
                <h2>Admin Portal</h2>
                <p className={styles.subtitle}>Secure access for system administrators</p>

                <form onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label>ADMIN EMAIL</label>
                        <input
                            type="email"
                            placeholder="admin@resora.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
                    </button>
                </form>

                <div className={styles.footer}>
                    © 2026 RESORA System · v2.5.0
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
