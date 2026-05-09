/**
 * Courses Management Page
 * List, add, delete courses
 */

import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, deleteCourse, getTeachers, getDepartments } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './Courses.module.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({
        course_code: '',
        name: '',
        credit_hours: '3',
        department_id: '',
        course_type: 'Theory',
        semester: '1',
        teacher_id: ''
    });
    const [error, setError] = useState('');

    const courseTypes = ['Theory', 'Lab', 'Practical', 'Elective'];
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [searchTerm, courses]);

    const fetchData = async () => {
        setLoading(true);
        const [coursesRes, teachersRes, deptsRes] = await Promise.all([
            getCourses(),
            getTeachers(),
            getDepartments()
        ]);

        if (coursesRes.success) setCourses(coursesRes.data || []);
        if (teachersRes.success) setTeachers(teachersRes.data || []);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
        setLoading(false);
    };

    const filterCourses = () => {
        if (!searchTerm) {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter(course =>
                course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCourses(filtered);
        }
    };

    const handleAddCourse = async () => {
        if (!formData.course_code || !formData.name || !formData.department_id || !formData.teacher_id) {
            setError('Course code, name, department, and teacher are required');
            return;
        }

        const result = await createCourse({
            ...formData,
            credit_hours: parseInt(formData.credit_hours),
            semester: parseInt(formData.semester),
            teacher_id: formData.teacher_id || null
        });

        if (result.success) {
            setShowAddModal(false);
            setFormData({
                course_code: '',
                name: '',
                credit_hours: '3',
                department_id: '',
                course_type: 'Theory',
                semester: '1',
                teacher_id: ''
            });
            fetchData();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;
        const result = await deleteCourse(selectedCourse.course_code);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedCourse(null);
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
                    <h1>Courses</h1>
                    <p>{courses.length} courses total</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📚</span>
                    <span className={styles.statLabel}>Total Courses</span>
                    <span className={styles.statValue}>{courses.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⏱️</span>
                    <span className={styles.statLabel}>Total Credits</span>
                    <span className={styles.statValue}>{courses.reduce((acc, c) => acc + parseInt(c.credit_hours || 0), 0)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🔬</span>
                    <span className={styles.statLabel}>Lab Courses</span>
                    <span className={styles.statValue}>{courses.filter(c => c.course_type === 'Lab').length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>👨‍🏫</span>
                    <span className={styles.statLabel}>Unassigned</span>
                    <span className={styles.statValue}>{courses.filter(c => !c.Teacher?.name).length}</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className={styles.resultsCount}>{filteredCourses.length} of {courses.length} results</span>
                    </div>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>COURSE</th>
                            <th>CODE</th>
                            <th>CREDITS</th>
                            <th>TYPE</th>
                            <th>SEMESTER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const typeColor = course.course_type === 'Lab' ? 'pink' : course.course_type === 'Practical' ? 'orange' : course.course_type === 'Elective' ? 'blue' : 'green';

                            return (
                                <tr key={course.course_code}>
                                    <td>
                                        <div className={styles.courseCell}>
                                            <div className={styles.courseIcon} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>
                                                📚
                                            </div>
                                            <strong>{course.name}</strong>
                                        </div>
                                    </td>
                                    <td><code><strong>{course.course_code}</strong></code></td>
                                    <td>{course.credit_hours} cr</td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${typeColor})`, color: `var(--text-${typeColor}-dark)` }}>{course.course_type || 'Theory'}</span></td>
                                    <td>Sem {course.semester}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredCourses.length === 0 && (
                    <div className={styles.emptyState}>No courses found</div>
                )}
            </div>

            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddCourse}
                title="Add Course"
                message={
                    <div className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Course Code:</label>
                                <input
                                    type="text"
                                    value={formData.course_code}
                                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                                    placeholder="CS-301"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Course Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Data Structures"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Credit Hours:</label>
                                <select
                                    value={formData.credit_hours}
                                    onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
                                >
                                    <option value="1">1 Credit</option>
                                    <option value="2">2 Credits</option>
                                    <option value="3">3 Credits</option>
                                    <option value="4">4 Credits</option>
                                </select>
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
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Course Type:</label>
                                <select
                                    value={formData.course_type}
                                    onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                                >
                                    {courseTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Semester:</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    {semesters.map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Teacher (Optional):</label>
                            <select
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
                confirmText="Add Course"
                confirmVariant="primary"
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCourse}
                title="Delete Course"
                message={`Are you sure you want to delete "${selectedCourse?.course_code} - ${selectedCourse?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Courses;