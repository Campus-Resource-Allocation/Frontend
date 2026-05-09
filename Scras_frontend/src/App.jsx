import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import { isAuthenticated, getCurrentUser } from './services/auth_service';

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

const App = () => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const setCookie = (name, value) => {
        document.cookie = `${name}=${value}; path=/; max-age=31536000`;
    };

    const [theme, setTheme] = useState(getCookie('theme') || localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        setCookie('theme', theme);

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

    return (
        <Routes>
            <Route path="/login" element={<Login theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/admin/login" element={<AdminLogin theme={theme} toggleTheme={toggleTheme} />} />
            
            <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin" theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/student/*" element={<ProtectedRoute allowedRole="student" theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/teacher/*" element={<ProtectedRoute allowedRole="teacher" theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/ta/*" element={<ProtectedRoute allowedRole="ta" theme={theme} toggleTheme={toggleTheme} />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const ProtectedRoute = ({ allowedRole, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activePage, setActivePage] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            if (allowedRole === 'admin') {
                navigate('/admin/login', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
            return;
        }

        const user = getCurrentUser();
        const userRole = user?.role?.toLowerCase();

        if (userRole !== allowedRole) {
            navigate(`/${userRole}/dashboard`, { replace: true });
            return;
        }

        const path = location.pathname.split('/')[2] || 'dashboard';
        setActivePage(path);
    }, [allowedRole, navigate, location]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            
            if (allowedRole === 'admin') {
                navigate('/admin/login', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }
    };

    if (!isAuthenticated()) {
        return null;
    }

    const user = getCurrentUser();
    const userRole = user?.role?.toLowerCase();

    if (userRole !== allowedRole) {
        return null;
    }

    return (
        <div className="app">
            <Sidebar 
                userRole={userRole}
                activePage={activePage}
                onPageChange={(page) => {
                    setActivePage(page);
                    navigate(`/${userRole}/${page}`);
                }}
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
                    <Routes>
                        {userRole === 'admin' && (
                            <>
                                <Route path="dashboard" element={<Departments />} />
                                <Route path="departments" element={<Departments />} />
                                <Route path="teachers" element={<Teachers />} />
                                <Route path="students" element={<Students />} />
                                <Route path="rooms" element={<Rooms />} />
                                <Route path="courses" element={<Courses />} />
                                <Route path="approvals" element={<ApprovalQueue />} />
                                <Route path="upload-timetable" element={<TimetableUpload />} />
                                <Route path="tas" element={<TAs />} />
                                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                            </>
                        )}
                        
                        {userRole === 'student' && (
                            <>
                                <Route path="dashboard" element={<StudentTimetable />} />
                                <Route path="timetable" element={<StudentTimetable />} />
                                <Route path="find-class" element={<StudentClassFinder />} />
                                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                            </>
                        )}
                        
                        {userRole === 'teacher' && (
                            <>
                                <Route path="dashboard" element={<MyBookings onPageChange={setActivePage} />} />
                                <Route path="my-schedule" element={<MyBookings onPageChange={setActivePage} />} />
                                <Route path="room-finder" element={<RoomFinder />} />
                                <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                            </>
                        )}
                        
                        {userRole === 'ta' && (
                            <>
                                <Route path="dashboard" element={<TAMyBookings onPageChange={setActivePage} />} />
                                <Route path="my-schedule" element={<TAMyBookings onPageChange={setActivePage} />} />
                                <Route path="room-finder" element={<TARoomFinder />} />
                                <Route path="*" element={<Navigate to="/ta/dashboard" replace />} />
                            </>
                        )}
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default App;