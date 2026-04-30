/**
 * Admin Dashboard - Overview Page
 * Shows statistics and quick actions
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDepartments, getTeachers, getStudents, getRooms, getCourses } from '../../services/admin_service';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        departments: 0,
        teachers: 0,
        students: 0,
        rooms: 0,
        courses: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);

        const [depts, teachers, students, rooms, courses] = await Promise.all([
            getDepartments(),
            getTeachers(),
            getStudents(),
            getRooms(),
            getCourses()
        ]);

        setStats({
            departments: depts.data?.length || 0,
            teachers: teachers.data?.length || 0,
            students: students.data?.length || 0,
            rooms: rooms.data?.length || 0,
            courses: courses.data?.length || 0
        });

        setLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    const statCards = [
        { title: 'Departments', value: stats.departments, icon: '🏛️', color: 'blue', link: '/admin/departments' },
        { title: 'Teachers', value: stats.teachers, icon: '👨‍🏫', color: 'green', link: '/admin/teachers' },
        { title: 'Students', value: stats.students, icon: '👨‍🎓', color: 'purple', link: '/admin/students' },
        { title: 'Rooms', value: stats.rooms, icon: '🚪', color: 'orange', link: '/admin/rooms' },
        { title: 'Courses', value: stats.courses, icon: '📚', color: 'red', link: '/admin/courses' },
    ];

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Welcome back, Admin</p>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="action-btn">➕ Add Department</button>
                    <button className="action-btn">👨‍🏫 Add Teacher</button>
                    <button className="action-btn">👨‍🎓 Add Student</button>
                    <button className="action-btn">🚪 Add Room</button>
                    <button className="action-btn">📚 Add Course</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;