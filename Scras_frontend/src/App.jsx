import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import { isAuthenticated, getCurrentUser, getUserRole } from './services/auth_service';

// Admin Pages
import Departments from './pages/admin/Departments';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Rooms from './pages/admin/Rooms';
import Courses from './pages/admin/Courses';
import ApprovalQueue from './pages/admin/ApprovalQueue';
import TimetableUpload from './pages/admin/TimetableUpload';
import TAs from './pages/admin/TAs';

// Student Pages
import StudentTimetable from './pages/student/StudentTimetable';
import StudentClassFinder from './pages/student/StudentClassFinder';

// Teacher & TA Pages
import RoomFinder from './pages/teacher/RoomFinder';
import MyBookings from './pages/teacher/MyBookings';
import TARoomFinder from './pages/ta/RoomFinder';
import TAMyBookings from './pages/ta/MyBookings';

import api from './services/api_config';

import AdminLogin from './pages/admin/AdminLogin';

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('departments');
    const [loading, setLoading] = useState(true);
    
    // Helper to get/set cookies for cross-port (localhost) theme sharing
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const setCookie = (name, value) => {
        document.cookie = `${name}=${value}; path=/; domain=localhost; max-age=31536000`; // 1 year
    };

    // Global Theme State: Check cookie first, then localStorage, default to light
    const [theme, setTheme] = useState(getCookie('theme') || localStorage.getItem('theme') || 'light');

    // Detect if this is the Admin Portal (Port 5000)
    const isAdminPortal = window.location.port === '5000';

    // Apply Theme Globally and Listen for Cross-Tab Changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme); // Triggers 'storage' event for other tabs
        setCookie('theme', theme);

        // Listen for changes from other tabs (Real-time sync)
        const handleStorageChange = (e) => {
            if (e.key === 'theme' && e.newValue) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        if (isAuthenticated()) {
            const userData = getCurrentUser();
            const userRole = userData?.role?.toLowerCase();

            // Strict security check: If on Admin Portal, only allow Admins
            if (isAdminPortal && userRole !== 'admin') {
                handleLogout(); // Kick out non-admins from port 5000
                return;
            }

            setAuthenticated(true);
            setUser(userData);

            // Set default landing page based on role
            if (userRole === 'student') setActivePage('timetable');
            else if (userRole === 'teacher' || userRole === 'ta') setActivePage('my-schedule');
            else setActivePage('departments');
        }
        setLoading(false);

        const handleExternalPageChange = (e) => {
            if (e.detail) setActivePage(e.detail);
        };
        window.addEventListener('onPageChange', handleExternalPageChange);
        return () => window.removeEventListener('onPageChange', handleExternalPageChange);
    }, [isAdminPortal]);

    const handleLoginSuccess = (userData) => {
        setAuthenticated(true);
        setUser(userData);

        const role = userData?.role?.toLowerCase();
        if (role === 'student') setActivePage('timetable');
        else if (role === 'teacher' || role === 'ta') setActivePage('my-schedule');
        else setActivePage('departments');
        
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout API failed:', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setAuthenticated(false);
            setUser(null);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!authenticated) {
        // Render either Admin Portal or User Portal login
        return isAdminPortal 
            ? <AdminLogin onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} /> 
            : <Login onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
    }

    const userRole = user?.role?.toLowerCase();

    const renderContent = () => {
        if (userRole === 'admin') {
            switch (activePage) {
                case 'departments': return <Departments />;
                case 'teachers': return <Teachers />;
                case 'students': return <Students />;
                case 'rooms': return <Rooms />;
                case 'courses': return <Courses />;
                case 'approvals': return <ApprovalQueue />;
                case 'upload-timetable': return <TimetableUpload />;
                case 'tas': return <TAs />;
                default: return <Departments />;
            }
        }

        if (userRole === 'student') {
            switch (activePage) {
                case 'timetable': return <StudentTimetable />;
                case 'find-class': return <StudentClassFinder />;
                default: return <StudentTimetable />;
            }
        }

        if (userRole === 'teacher') {
            switch (activePage) {
                case 'my-schedule': return <MyBookings onPageChange={setActivePage} />;
                case 'room-finder': return <RoomFinder />;
                default: return <MyBookings onPageChange={setActivePage} />;
            }
        }

        if (userRole === 'ta') {
            switch (activePage) {
                case 'my-schedule': return <TAMyBookings onPageChange={setActivePage} />;
                case 'room-finder': return <TARoomFinder />;
                default: return <TAMyBookings onPageChange={setActivePage} />;
            }
        }

        return <div>Welcome {user?.role}</div>;
    };

    return (
        <div className="app">
            <Sidebar 
                userRole={userRole} 
                activePage={activePage} 
                onPageChange={setActivePage} 
                onLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <div className="main-content">
                <TopNavbar 
                    user={user} 
                    onLogout={handleLogout} 
                    activePage={activePage} 
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <div className="page-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default App;