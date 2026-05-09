import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ ADD THIS
import { login } from '../../services/auth_service';
import styles from './AdminLogin.module.css';

const AdminLogin = ({ theme, toggleTheme }) => {  // ✅ REMOVE onLoginSuccess
    const navigate = useNavigate();  // ✅ ADD THIS
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);  // ✅ ADD THIS

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success && result.user?.role?.toLowerCase() === 'admin') {
            // ✅ Store credentials
            localStorage.setItem('access_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // ✅ Navigate to admin dashboard
            navigate('/admin/dashboard', { replace: true });
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </span>
                </div>

                <h2>Admin Portal</h2>
                <p className={styles.subtitle}>Secure access for system administrators</p>

                <form onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label>ADMIN EMAIL</label>
                        <input
                            type="email"
                            placeholder="[EMAIL_ADDRESS]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>PASSWORD</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                style={{ paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.passwordToggle}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
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