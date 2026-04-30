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

import './styles/main.css';

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('departments');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated()) {
            setAuthenticated(true);
            const userData = getCurrentUser();
            setUser(userData);

            // Set default landing page based on role
            const role = userData?.role?.toLowerCase();
            if (role === 'student') setActivePage('timetable');
            else if (role === 'teacher' || role === 'ta') setActivePage('my-schedule');
            else setActivePage('departments');
        }
        setLoading(false);

        // Global page change listener
        const handleExternalPageChange = (e) => {
            if (e.detail) setActivePage(e.detail);
        };
        window.addEventListener('onPageChange', handleExternalPageChange);
        return () => window.removeEventListener('onPageChange', handleExternalPageChange);
    }, []);

    const handleLoginSuccess = (userData) => {
        setAuthenticated(true);
        setUser(userData);

        // Redirect on login
        const role = userData?.role?.toLowerCase();
        if (role === 'student') setActivePage('timetable');
        else if (role === 'teacher' || role === 'ta') setActivePage('my-schedule');
        else setActivePage('departments');
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setAuthenticated(false);
        setUser(null);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!authenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
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
                case 'my-schedule': return <MyBookings onPageChange={setActivePage} />; // Reusing MyBookings as schedule/bookings manager
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
            <Sidebar userRole={userRole} activePage={activePage} onPageChange={setActivePage} onLogout={handleLogout} />
            <div className="main-content">
                <TopNavbar user={user} onLogout={handleLogout} activePage={activePage} />
                <div className="page-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default App;