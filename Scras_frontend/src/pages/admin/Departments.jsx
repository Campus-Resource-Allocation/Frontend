/**
 * Departments Management Page
 * List, add, delete departments
 */

import React, { useState, useEffect } from 'react';
import { getDepartments, getDashboardStats } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './Departments.module.css';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total_depts: 0,
        total_students: 0,
        total_courses: 0,
        total_teachers: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchDepartments(), fetchStats()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        const result = await getDashboardStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
    };

    const fetchDepartments = async () => {
        const result = await getDepartments();
        if (result.success) {
            setDepartments(result.data || []);
        } else {
            setError(result.message);
        }
    };

    useEffect(() => {
        filterDepartments();
    }, [searchTerm, departments]);

    const filterDepartments = () => {
        if (!searchTerm) {
            setFilteredDepts(departments);
        } else {
            const filtered = departments.filter(dept =>
                dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDepts(filtered);
        }
    };



    const deptHeads = [
        "Dr. Zareen Alamgir",
        "Dr. Faiza Awan",
        "Dr. Amir Wali",
        "Prof. Hira Zafar",
        "Dr. Amara Okoro",
        "Prof. David Miller",
        "Dr. Sophia Lee",
        "Prof. Robert Taylor",
        "Dr. Maria Garcia"
    ];

    const [headIndex, setHeadIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeadIndex((prev) => (prev + 1) % deptHeads.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Departments</h1>
                    <p>{departments.length} departments · {stats.total_students} enrolled students</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🏛️</span>
                    <span className={styles.statLabel}>Total Departments</span>
                    <span className={styles.statValue}>{stats.total_depts}</span>
                    <span className={styles.statSubtext}>Active faculties</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🎓</span>
                    <span className={styles.statLabel}>Total Students</span>
                    <span className={styles.statValue}>{stats.total_students.toLocaleString()}</span>
                    <span className={styles.statSubtext}>Enrolled</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📚</span>
                    <span className={styles.statLabel}>Total Courses</span>
                    <span className={styles.statValue}>{stats.total_courses}</span>
                    <span className={styles.statSubtext}>Offered this semester</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>👨‍🏫</span>
                    <span className={styles.statLabel}>Dept Heads</span>
                    <div className={styles.tickerContainer}>
                        <span key={headIndex} className={styles.statValueTicker}>
                            {deptHeads[headIndex]}
                        </span>
                    </div>
                    <span className={styles.statSubtext}>Faculty leads ({deptHeads.length})</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className={styles.resultsCount}>{filteredDepts.length} of {departments.length} results</span>
                    </div>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>CODE</th>
                            <th>DEPARTMENT</th>
                            <th>HEAD</th>
                            <th>STUDENTS</th>
                            <th>COURSES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDepts.map((dept, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const students = Math.floor(Math.random() * 300) + 200;
                            const courses = Math.floor(Math.random() * 20) + 10;
                            const code = dept.name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase();
                            return (
                                <tr key={dept.department_id}>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>{code || 'DPT'}</span></td>
                                    <td><span className={styles.deptIcon}>🏛️</span> <strong>{dept.name}</strong></td>
                                    <td>{deptHeads[index % deptHeads.length]}</td>
                                    <td>
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressLine} style={{ color: `var(--text-${color}-dark)` }}></div>
                                            <span>{students}</span>
                                        </div>
                                    </td>
                                    <td>{courses}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredDepts.length === 0 && (
                    <div className={styles.emptyState}>No departments found</div>
                )}
            </div>

        </div>
    );
};

export default Departments;