/**
 * Admin Dashboard - Overview Page
 * Shows statistics and quick actions
 */

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDepartments, getTeachers, getStudents, getRooms, getCourses } from '../../services/admin_service';
import styles from './AdminDashboard.module.css';

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
        { title: 'Departments', value: stats.departments, icon: '🏛️', colorClass: styles.statBlue, link: '/admin/departments' },
        { title: 'Teachers', value: stats.teachers, icon: '👨‍🏫', colorClass: styles.statGreen, link: '/admin/teachers' },
        { title: 'Students', value: stats.students, icon: '👨‍🎓', colorClass: styles.statPurple, link: '/admin/students' },
        { title: 'Rooms', value: stats.rooms, icon: '🚪', colorClass: styles.statOrange, link: '/admin/rooms' },
        { title: 'Courses', value: stats.courses, icon: '📚', colorClass: styles.statRed, link: '/admin/courses' },
    ];

    return (
        <div className={styles.adminDashboard}>
            <div className={styles.dashboardHeader}>
                <h1>Dashboard</h1>
                <p>Welcome back, Admin</p>
            </div>

            <div className={styles.statsGrid}>
                {statCards.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={`${styles.statIcon} ${stat.colorClass}`}>{stat.icon}</div>
                        <div className={styles.statInfo}>
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                    <button className={styles.actionBtn}>➕ Add Department</button>
                    <button className={styles.actionBtn}>👨‍🏫 Add Teacher</button>
                    <button className={styles.actionBtn}>👨‍🎓 Add Student</button>
                    <button className={styles.actionBtn}>🚪 Add Room</button>
                    <button className={styles.actionBtn}>📚 Add Course</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;