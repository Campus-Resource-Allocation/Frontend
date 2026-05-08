import React from 'react';

const TopNavbar = ({ user, onLogout, activePage = 'departments', theme, toggleTheme }) => {
    const capitalize = (str) => {
        if (!str) return '';
        // Convert kebab-case or camelCase to Title Case
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const userRole = user?.role?.toLowerCase() || 'admin';
    const roleTitle = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    return (
        <div className="top-navbar" style={{
            height: '64px',
            background: 'var(--navbar-bg, white)',
            borderBottom: '1px solid var(--border-color, #eef2f6)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
        }}>
            <div className="navbar-left">
                <div className="breadcrumb" style={{
                    fontSize: '13px',
                    color: 'var(--text-muted, #64748b)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                }}>
                    <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{roleTitle}</span>
                    <span style={{ color: 'var(--text-muted, #cbd5e1)' }}>&gt;</span>
                    <span style={{ color: 'var(--text-primary, #1e293b)', fontWeight: '600' }}>{capitalize(activePage)}</span>
                </div>
            </div>

            <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted, #64748b)',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s',
                        fontSize: '20px'
                    }}
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--badge-bg, #f0fdf4)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid var(--badge-border, #dcfce7)'
                }}>
                    <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }}></span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--badge-text, #15803d)', letterSpacing: '0.02em' }}>LIVE</span>
                </div>

                <button style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #64748b)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.15s'
                }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                <div className="profile-trigger" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '4px 4px 4px 12px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer'
                }} onClick={onLogout}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{roleTitle}</span>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: userRole === 'student' ? '#7c3aed' : '#0ea5e9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700'
                    }}>
                        {userRole.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopNavbar;