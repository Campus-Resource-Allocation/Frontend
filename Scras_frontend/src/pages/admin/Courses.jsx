/**
 * Courses Management Page
 * List, add, delete courses
 */

import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, deleteCourse } from '../../services/admin_service';
import { getTeachers } from '../../services/admin_service';
import { getDepartments } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

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

        if (coursesRes.success) {
            setCourses(coursesRes.data || []);
        }
        if (teachersRes.success) {
            setTeachers(teachersRes.data || []);
        }
        if (deptsRes.success) {
            setDepartments(deptsRes.data || []);
        }
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
        <div className="courses-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Courses</h1>
                    <p>{courses.length} courses total</p>
                </div>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                <div className="stat-card card-peach">
                    <span className="stat-icon" style={{color: '#8b5cf6'}}>📚</span>
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">{courses.length}</span>
                </div>
                <div className="stat-card card-green">
                    <span className="stat-icon" style={{color: '#10b981'}}>⏱️</span>
                    <span className="stat-label">Total Credits</span>
                    <span className="stat-value">{courses.reduce((acc, c) => acc + parseInt(c.credit_hours || 0), 0)}</span>
                </div>
                <div className="stat-card card-orange">
                    <span className="stat-icon" style={{color: '#f59e0b'}}>🔬</span>
                    <span className="stat-label">Lab Courses</span>
                    <span className="stat-value">{courses.filter(c => c.course_type === 'Lab').length}</span>
                </div>
                <div className="stat-card card-pink">
                    <span className="stat-icon" style={{color: '#ec4899'}}>👨‍🏫</span>
                    <span className="stat-label">Unassigned</span>
                    <span className="stat-value">{courses.filter(c => !c.Teacher?.name).length}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredCourses.length} of {courses.length} results</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>COURSE</th>
                            <th>CODE</th>
                            <th>CREDITS</th>
                            <th>DEPARTMENT</th>
                            <th>TYPE</th>
                            <th>SEMESTER</th>
                            <th>TEACHER</th>
                            <th>ACTIONS</th>
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
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'}}>
                                                📚
                                            </div>
                                            <strong>{course.name}</strong>
                                        </div>
                                    </td>
                                    <td><code><strong>{course.course_code}</strong></code></td>
                                    <td>{course.credit_hours} cr</td>
                                    <td><span className={`badge badge-${color}`}>{course.Department?.name || 'N/A'}</span></td>
                                    <td><span className={`badge badge-${typeColor}`}>{course.course_type || 'Theory'}</span></td>
                                    <td>Sem {course.semester}</td>
                                    <td><span style={{color: '#64748b'}}>👨‍🏫 {course.Teacher?.name || 'Unassigned'}</span></td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredCourses.length === 0 && (
                    <div className="empty-state">No courses found</div>
                )}
            </div>

            {/* Add Course Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddCourse}
                title="Add Course"
                message={
                    <div className="modal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Course Code:</label>
                                <input
                                    type="text"
                                    value={formData.course_code}
                                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                                    placeholder="CS-301"
                                />
                            </div>
                            <div className="form-group">
                                <label>Course Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Data Structures"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
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
                            <div className="form-group">
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
                        <div className="form-row">
                            <div className="form-group">
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
                            <div className="form-group">
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
                        <div className="form-group">
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

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteCourse}
                title="Delete Course"
                message={`Are you sure you want to delete "${selectedCourse?.course_code} - ${selectedCourse?.name}"? This will also remove it from all schedules.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Courses;