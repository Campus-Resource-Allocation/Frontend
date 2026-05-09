import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth_service';
import styles from './Login.module.css';

const Login = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('teacher');
    const [email, setEmail] = useState(''); // Changed from username
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        {
            id: 'teacher',
            name: 'Teacher',
            description: 'Faculty portal',
            color: '#0ea5e9',
            icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
            )
        },
        {
            id: 'ta',
            name: 'Teaching Assistant',
            description: 'TA portal',
            color: '#334155',
            icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
            )
        },
        {
            id: 'student',
            name: 'Student',
            description: 'Student portal',
            color: '#1e293b',
            icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
            )
        }
    ];

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        
        setLoading(true);
        setError('');
        
        const result = await login(email, password); // Changed to email
        
        if (result.success) {
            const userRole = result.user.role.toLowerCase();
            const uiRole = selectedRole.toLowerCase();
            
            if (userRole !== uiRole) {
                setError(`Access Denied: This account belongs to a ${result.user.role}, but you selected ${selectedRole.toUpperCase()}.`);
                setLoading(false);
                return;
            }
            
            // Store token and user data
            localStorage.setItem('access_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Navigate to appropriate dashboard
            navigate(`/${userRole}/dashboard`, { replace: true });
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    const portalName = selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'ta' ? 'TA' : 'Student';

    return (
        <div className={styles.page}>
            <button 
                onClick={toggleTheme}
                className={styles.themeToggle}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.brandSide}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className={styles.logoText}>SCRAS</span>
                        </div>
                        <h1>Campus Resource<br />Allocation System</h1>
                        <p className={styles.brandDescription}>
                            Streamline your campus operations with intelligent scheduling,
                            room management, and resource allocation.
                        </p>
                        <div className={styles.features}>
                            {[
                                { label: 'Multi-department management', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17" /></svg> },
                                { label: 'Automated timetable generation', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                                { label: 'Role-based access control', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5" /></svg> },
                                { label: 'Real-time room booking', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> }
                            ].map((item, idx) => (
                                <div key={idx} className={styles.feature}>
                                    <span className={styles.featureIcon}>{item.icon}</span>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                        <div className={styles.brandFooter}>
                            <div className={styles.statusIndicator}>
                                <span className={styles.statusDot}></span>
                                All systems operational
                            </div>
                            <div className={styles.copyright}>
                                © 2026 SCRAS Platform. v2.1.0
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSide}>
                        <div className={styles.formWrapper}>
                            <h2>Sign in to your portal</h2>
                            <p className={styles.formSubtitle}>Select your role and enter your credentials</p>

                            <p className={styles.sectionLabel}>SELECT ROLE</p>
                            <div className={styles.roleSelector}>
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        className={`${styles.roleBtn} ${selectedRole === role.id ? styles.roleBtnActive : ''}`}
                                        onClick={() => handleRoleSelect(role.id)}
                                        style={selectedRole === role.id ? { borderColor: role.color } : {}}
                                    >
                                        <span className={styles.roleIcon} style={{
                                            background: selectedRole === role.id ? role.color : 'rgba(255, 255, 255, 0.03)',
                                            color: selectedRole === role.id ? 'white' : 'var(--text-muted)',
                                            border: selectedRole === role.id ? 'none' : '1px solid var(--border-color)'
                                        }}>
                                            {role.icon}
                                        </span>
                                        <div className={styles.roleInfo}>
                                            <strong>{role.name}</strong>
                                            <span>{role.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.inputGroup}>
                                    <label>EMAIL</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        disabled={loading}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>PASSWORD</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        disabled={loading}
                                        style={{ paddingRight: '44px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={styles.passwordToggle}
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

                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Signing in...' : `Continue to ${portalName} Portal →`}
                                </button>
                            </form>

                            <div className={styles.footer}>
                                <span>Protected by RESORA Auth · Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;