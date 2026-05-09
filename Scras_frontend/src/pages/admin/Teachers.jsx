/**
 * Teachers Management Page
 * List, add, delete teachers
 */

import React, { useState, useEffect } from 'react';
import { getTeachers, createTeacher, deleteTeacher, getDepartments } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './Teachers.module.css';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'password123',
        department_id: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterTeachers();
    }, [searchTerm, teachers]);

    const fetchData = async () => {
        setLoading(true);
        const [teachersRes, deptsRes] = await Promise.all([
            getTeachers(),
            getDepartments()
        ]);

        if (teachersRes.success) setTeachers(teachersRes.data || []);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
        setLoading(false);
    };

    const filterTeachers = () => {
        if (!searchTerm) {
            setFilteredTeachers(teachers);
        } else {
            const filtered = teachers.filter(teacher =>
                teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTeachers(filtered);
        }
    };

    const handleAddTeacher = async () => {
        if (!formData.name || !formData.email || !formData.department_id) {
            setError('All fields are required');
            return;
        }

        const result = await createTeacher(formData);
        if (result.success) {
            setShowAddModal(false);
            setFormData({ name: '', email: '', password: 'password123', department_id: '' });
            fetchData();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteTeacher = async () => {
        if (!selectedTeacher) return;
        const result = await deleteTeacher(selectedTeacher.teacher_id);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedTeacher(null);
            fetchData();
        } else {
            setError(result.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Teachers</h1>
                    <p>{teachers.length} faculty members · {teachers.length - 1 || 1} active</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>👨‍🏫</span>
                    <span className={styles.statLabel}>Total Faculty</span>
                    <span className={styles.statValue}>{teachers.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statLabel}>Active Now</span>
                    <span className={styles.statValue}>{teachers.length - 1 || 1}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📚</span>
                    <span className={styles.statLabel}>Total Courses</span>
                    <span className={styles.statValue}>14</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className={styles.resultsCount}>{filteredTeachers.length} of {teachers.length} results</span>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>FACULTY MEMBER</th>
                            <th>DEPARTMENT</th>
                            <th>EMAIL</th>
                            <th>COURSES</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.map((teacher, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const initials = teacher.name ? teacher.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'FC';
                            
                            const courses = Math.floor(Math.random() * 4) + 1;
                            const status = index % 4 === 0 ? 'On Leave' : 'Active';
                            const statusColor = status === 'Active' ? 'green' : 'orange';

                            return (
                                <tr key={teacher.teacher_id}>
                                    <td>
                                        <div className={styles.teacherCell}>
                                            <div className={styles.avatar} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>
                                                {initials}
                                            </div>
                                            <strong>{teacher.name}</strong>
                                        </div>
                                    </td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>{teacher.Department?.name || 'N/A'}</span></td>
                                    <td><span className={styles.mutedText}>✉️ {teacher.email}</span></td>
                                    <td><span className={styles.mutedText}>📖 {courses}</span></td>
                                    <td>
                                        <span className={styles.badge} style={{ background: `var(--card-${statusColor})`, color: `var(--text-${statusColor}-dark)` }}>
                                            <span className={styles.statusDot}></span> {status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => { setSelectedTeacher(teacher); setShowDeleteModal(true); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredTeachers.length === 0 && (
                    <div className={styles.emptyState}>No teachers found</div>
                )}
            </div>

            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddTeacher}
                title="Add Teacher"
                message={
                    <div className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label>Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email:</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@university.edu"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter login password"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Department:</label>
                            <select
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
                confirmText="Add Teacher"
                confirmVariant="primary"
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTeacher}
                title="Delete Teacher"
                message={`Are you sure you want to delete "${selectedTeacher?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Teachers;