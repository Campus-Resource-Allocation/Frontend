import React, { useState } from 'react';
import { login } from '../services/auth_service';

const Login = ({ onLoginSuccess }) => {
    const [selectedRole, setSelectedRole] = useState('admin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Demo credentials for each role
    const roleCredentials = {
        admin:   { email: 'admin@resora.com',        password: '12345678' },
        teacher: { email: 'hina.i@university.edu',   password: '12345678' },
        ta:      { email: 'ta.sana@nu.edu.pk',        password: '12345678' },
        student: { email: '24l0601@lhr.nu.edu.pk',   password: '12345678' }
    };

    const roles = [
        {
            id: 'admin',
            name: 'Admin',
            description: 'Full system access',
            color: '#7c3aed',
            bg: '#f5f3ff',
            icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            )
        },
        {
            id: 'teacher',
            name: 'Teacher',
            description: 'Faculty portal',
            color: '#0ea5e9',
            bg: '#f0f9ff',
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
            color: '#f59e0b',
            bg: '#fffbeb',
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
            color: '#10b981',
            bg: '#f0fdf4',
            icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
            )
        }
    ];

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        const creds = roleCredentials[roleId];
        setUsername(creds.email);
        setPassword(creds.password);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        setLoading(true);
        setError('');
        const result = await login(username, password);
        if (result.success) {
            onLoginSuccess(result.user);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const selectedRoleObj = roles.find(r => r.id === selectedRole);
    const portalName = selectedRole === 'admin' ? 'Admin' : selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'ta' ? 'TA' : 'Student';

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Left Side - Branding */}
                <div className="login-brand">
                    <div className="logo">
                        <span style={{
                            background: '#7c3aed',
                            borderRadius: '10px',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </span>
                        <span className="logo-text">SCRAS</span>
                    </div>
                    <h1>Campus Resource<br />Allocation System</h1>
                    <p className="brand-description">
                        Streamline your campus operations with intelligent scheduling,
                        room management, and resource allocation.
                    </p>
                    <div className="features">
                        {[
                            { label: 'Multi-department management', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg> },
                            { label: 'Automated timetable generation', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                            { label: 'Role-based access control', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5"/></svg> },
                            { label: 'Real-time room booking', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> }
                        ].map((item, idx) => (
                            <div key={idx} className="feature">
                                <span style={{ opacity: 0.7 }}>{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '48px' }}>
                        <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                            All systems operational
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                            © 2026 SCRAS Platform. v2.1.0
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="login-form-container">
                    <div className="form-wrapper">
                        <h2>Sign in to your portal</h2>
                        <p className="form-subtitle">Select your role and enter your credentials</p>

                        {/* Role Selection - 2x2 Grid */}
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '12px' }}>SELECT ROLE</p>
                        <div className="role-selector">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
                                    onClick={() => handleRoleSelect(role.id)}
                                    style={{
                                        borderColor: selectedRole === role.id ? role.color : '#e2d9cc',
                                        backgroundColor: selectedRole === role.id ? role.bg : '#ede7db',
                                        outline: selectedRole === role.id ? `2px solid ${role.color}` : 'none',
                                    }}
                                >
                                    <span className="role-icon" style={{
                                        background: selectedRole === role.id ? role.color : '#ddd5c5',
                                        color: selectedRole === role.id ? 'white' : '#64748b',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {role.icon}
                                    </span>
                                    <div className="role-info">
                                        <strong style={{ color: selectedRole === role.id ? '#1e293b' : '#374151' }}>{role.name}</strong>
                                        <span>{role.description}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>USERNAME</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group" style={{ position: 'relative' }}>
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
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        bottom: '14px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="continue-btn" disabled={loading}
                                style={{
                                    background: selectedRoleObj ? '#7c3aed' : '#7c3aed'
                                }}
                            >
                                {loading ? 'Signing in...' : `Continue to ${portalName} Portal →`}
                            </button>
                        </form>

                        <div className="login-footer">
                            <span>Protected by SCRAS Auth · Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;