import React from 'react';
import styles from './TopNavbar.module.css';

const TopNavbar = ({ user, onLogout, activePage = 'departments', theme, toggleTheme, onToggleSidebar }) => {
    const capitalize = (str) => {
        if (!str) return '';
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const userRole = user?.role?.toLowerCase() || 'admin';
    const roleTitle = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    return (
        <div className={styles.navbar}>
            <div className={styles.left}>
                <button className={styles.menuToggle} onClick={onToggleSidebar} aria-label="Toggle Menu">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
                <div className={styles.breadcrumb}>
                    <span className={styles.rolePart}>{roleTitle}</span>
                    <span className={styles.separator}>&gt;</span>
                    <span className={styles.pagePart}>{capitalize(activePage)}</span>
                </div>
            </div>

            <div className={styles.right}>
                <button 
                    onClick={toggleTheme}
                    className={styles.themeBtn}
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div className={styles.liveBadge}>
                    <span className={styles.liveDot}></span>
                    <span className={styles.liveText}>LIVE</span>
                </div>

                <button className={styles.iconBtn}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>

                <div className={styles.profileBtn} onClick={onLogout}>
                    <span className={styles.profileRole}>{roleTitle}</span>
                    <div className={styles.profileAvatar} style={{ background: userRole === 'student' ? '#7c3aed' : '#0ea5e9' }}>
                        {userRole.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopNavbar;