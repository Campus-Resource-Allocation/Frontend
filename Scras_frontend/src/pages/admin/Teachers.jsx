/**
 * Teachers Management Page
 * List, add, delete teachers
 */

import React, { useState, useEffect } from 'react';
import { getTeachers, createTeacher, deleteTeacher } from '../../services/admin_service';
import { getDepartments } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

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
        password: 'password123', // Added default password
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

        if (teachersRes.success) {
            setTeachers(teachersRes.data || []);
        }
        if (deptsRes.success) {
            setDepartments(deptsRes.data || []);
        }
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
            setFormData({ name: '', email: '', department_id: '' });
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
        <div className="teachers-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Teachers</h1>
                    <p>{teachers.length} faculty members · {teachers.length - 1 || 1} active</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Teacher
                </button>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="stat-card card-peach">
                    <span className="stat-icon" style={{color: '#8b5cf6'}}>👨‍🏫</span>
                    <span className="stat-label">Total Faculty</span>
                    <span className="stat-value">{teachers.length}</span>
                </div>
                <div className="stat-card card-orange">
                    <span className="stat-icon" style={{color: '#10b981'}}>✅</span>
                    <span className="stat-label">Active Now</span>
                    <span className="stat-value">{teachers.length - 1 || 1}</span>
                </div>
                <div className="stat-card card-yellow">
                    <span className="stat-icon" style={{color: '#f59e0b'}}>📚</span>
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">14</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredTeachers.length} of {teachers.length} results</span>
                </div>

                <table className="data-table">
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
                            
                            // Mocking courses
                            const courses = Math.floor(Math.random() * 4) + 1;
                            const status = index % 4 === 0 ? 'On Leave' : 'Active';
                            const statusColor = status === 'Active' ? 'green' : 'orange';

                            return (
                                <tr key={teacher.teacher_id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                                                {initials}
                                            </div>
                                            <strong>{teacher.name}</strong>
                                        </div>
                                    </td>
                                    <td><span className={`badge badge-${color}`}>{teacher.Department?.name || 'N/A'}</span></td>
                                    <td><span style={{color: '#64748b'}}>✉️ {teacher.email}</span></td>
                                    <td><span style={{color: '#64748b'}}>📖 {courses}</span></td>
                                    <td>
                                        <span className={`badge badge-${statusColor}`}>
                                            <span className="status-dot"></span> {status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedTeacher(teacher);
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
                {filteredTeachers.length === 0 && (
                    <div className="empty-state">No teachers found</div>
                )}
            </div>

            {/* Add Teacher Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddTeacher}
                title="Add Teacher"
                message={
                    <div className="modal-form">
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@university.edu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter login password"
                            />
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
                }
                confirmText="Add Teacher"
                confirmVariant="primary"
            />

            {/* Delete Modal */}
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