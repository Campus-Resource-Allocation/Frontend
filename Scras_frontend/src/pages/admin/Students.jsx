/**
 * Students Management Page
 * List, add, delete students
 */

import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent, getDepartments } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './Students.module.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        roll_number: '',
        name: '',
        email: '',
        batch_year: new Date().getFullYear(),
        semester: '',
        department_id: '',
        password: 'password123'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [searchTerm, students]);

    const fetchData = async () => {
        setLoading(true);
        const [studentsRes, deptsRes] = await Promise.all([
            getStudents(),
            getDepartments()
        ]);

        if (studentsRes.success) setStudents(studentsRes.data || []);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
        setLoading(false);
    };

    const filterStudents = () => {
        if (!searchTerm) {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    };

    const handleAddStudent = async () => {
        if (!formData.name || !formData.email || !formData.department_id || !formData.roll_number || !formData.password || !formData.semester) {
            setError('All fields are required');
            return;
        }

        const dataToSend = {
            name: formData.name,
            email: formData.email,
            roll_number: formData.roll_number,
            password: formData.password,
            semester: parseInt(formData.semester),
            batch_year: parseInt(formData.batch_year),
            department_id: parseInt(formData.department_id)
        };

        const result = await createStudent(dataToSend);
        if (result.success) {
            setShowAddModal(false);
            setFormData({
                roll_number: '',
                name: '',
                email: '',
                batch_year: new Date().getFullYear(),
                semester: '',
                department_id: '',
                password: 'password123'
            });
            setError('');
            fetchData();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;
        const result = await deleteStudent(selectedStudent.student_id);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedStudent(null);
            fetchData();
        } else {
            setError(result.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    const firstYearCount = students.filter(s => parseInt(s.semester || 1) <= 2).length;
    const secondYearCount = students.filter(s => parseInt(s.semester || 1) > 2 && parseInt(s.semester || 1) <= 4).length;
    const thirdYearCount = students.filter(s => parseInt(s.semester || 1) > 4 && parseInt(s.semester || 1) <= 6).length;
    const fourthYearCount = students.filter(s => parseInt(s.semester || 1) > 6).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Students</h1>
                    <p>{students.length} enrolled students</p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{
                    padding: '10px 20px', borderRadius: '12px', background: 'var(--admin-accent)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer'
                }}>+ Add Student</button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.iconWrapper} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>🎓</div>
                        <div>
                            <div className={styles.statValue}>{firstYearCount}</div>
                            <div className={styles.statLabel}>1st Year</div>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.iconWrapper} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>🎓</div>
                        <div>
                            <div className={styles.statValue}>{secondYearCount}</div>
                            <div className={styles.statLabel}>2nd Year</div>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.iconWrapper} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>🎓</div>
                        <div>
                            <div className={styles.statValue}>{thirdYearCount}</div>
                            <div className={styles.statLabel}>3rd Year</div>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.iconWrapper} style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>🎓</div>
                        <div>
                            <div className={styles.statValue}>{fourthYearCount}</div>
                            <div className={styles.statLabel}>4th Year</div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className={styles.resultsCount}>{filteredStudents.length} of {students.length} results</span>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>STUDENT</th>
                            <th>ID</th>
                            <th>DEPARTMENT</th>
                            <th>YEAR</th>
                            <th>EMAIL</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const initials = student.name ? student.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'ST';
                            
                            const yearDiff = new Date().getFullYear() - student.batch_year;
                            const displayYear = yearDiff === 0 ? '1st Year' : yearDiff === 1 ? '2nd Year' : yearDiff === 2 ? '3rd Year' : '4th Year';
                            const yearColor = yearDiff === 0 ? 'green' : yearDiff === 1 ? 'blue' : yearDiff === 2 ? 'orange' : 'pink';

                            return (
                                <tr key={student.student_id}>
                                    <td>
                                        <div className={styles.studentCell}>
                                            <div className={styles.avatar} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>
                                                {initials}
                                            </div>
                                            <strong>{student.name}</strong>
                                        </div>
                                    </td>
                                    <td>{student.roll_number}</td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>{student.department_name || 'N/A'}</span></td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${yearColor})`, color: `var(--text-${yearColor}-dark)` }}>{displayYear}</span></td>
                                    <td><span className={styles.emailText}>✉️ {student.email}</span></td>
                                    <td>
                                        <button onClick={() => { setSelectedStudent(student); setShowDeleteModal(true); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setError(''); }}
                onConfirm={handleAddStudent}
                title="Add Student"
                message={
                    <div className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Roll Number:</label>
                                <input
                                    type="text"
                                    value={formData.roll_number}
                                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                    placeholder="24L-0608"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Subhan"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="l240608@lhr.nu.edu.pk"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
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
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Batch Year:</label>
                                <select
                                    value={formData.batch_year}
                                    onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Semester:</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    <option value="">Select Semester</option>
                                    {[1,2,3,4,5,6,7,8].map(s => (
                                        <option key={s} value={s}>Semester {s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                }
                confirmText="Add Student"
                confirmVariant="primary"
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteStudent}
                title="Delete Student"
                message={`Are you sure you want to delete "${selectedStudent?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Students;