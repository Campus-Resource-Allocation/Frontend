/**
 * Students Management Page
 * List, add, delete students
 */

import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent } from '../../services/admin_service';
import { getDepartments } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

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
        section: 'A',
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

        if (studentsRes.success) {
            setStudents(studentsRes.data || []);
        }
        if (deptsRes.success) {
            setDepartments(deptsRes.data || []);
        }
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
        if (!formData.name || !formData.email || !formData.department_id || !formData.roll_number || !formData.password) {
            setError('All fields are required');
            return;
        }

        const result = await createStudent(formData);
        if (result.success) {
            setShowAddModal(false);
            setFormData({
                roll_number: '',
                name: '',
                email: '',
                batch_year: new Date().getFullYear(),
                section: 'A',
                department_id: '',
                password: 'password123'
            });
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

    return (
        <div className="students-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Students</h1>
                    <p>{students.length} enrolled students</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Student
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card card-green" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{background: 'white', padding: '8px', borderRadius: '8px', color: '#10b981'}}>🎓</div>
                        <div>
                            <div className="stat-value" style={{fontSize: '24px', marginBottom: '0'}}>1</div>
                            <div className="stat-label" style={{margin: '0'}}>1st Year</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card card-peach" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{background: 'white', padding: '8px', borderRadius: '8px', color: '#3b82f6'}}>🎓</div>
                        <div>
                            <div className="stat-value" style={{fontSize: '24px', marginBottom: '0'}}>1</div>
                            <div className="stat-label" style={{margin: '0'}}>2nd Year</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card card-orange" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{background: 'white', padding: '8px', borderRadius: '8px', color: '#f59e0b'}}>🎓</div>
                        <div>
                            <div className="stat-value" style={{fontSize: '24px', marginBottom: '0'}}>2</div>
                            <div className="stat-label" style={{margin: '0'}}>3rd Year</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card card-pink" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '24px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{background: 'white', padding: '8px', borderRadius: '8px', color: '#ec4899'}}>🎓</div>
                        <div>
                            <div className="stat-value" style={{fontSize: '24px', marginBottom: '0'}}>1</div>
                            <div className="stat-label" style={{margin: '0'}}>4th Year</div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredStudents.length} of {students.length} results</span>
                </div>

                <table className="data-table">
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
                            
                            // Mocking year based on batch year
                            const yearDiff = new Date().getFullYear() - student.batch_year;
                            const displayYear = yearDiff === 0 ? '1st Year' : yearDiff === 1 ? '2nd Year' : yearDiff === 2 ? '3rd Year' : '4th Year';
                            const yearColor = yearDiff === 0 ? 'green' : yearDiff === 1 ? 'blue' : yearDiff === 2 ? 'orange' : 'pink';

                            return (
                                <tr key={student.student_id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                                                {initials}
                                            </div>
                                            <strong>{student.name}</strong>
                                        </div>
                                    </td>
                                    <td>{student.roll_number}</td>
                                    <td><span className={`badge badge-${color}`}>{student.Department?.name || 'N/A'}</span></td>
                                    <td><span className={`badge badge-${yearColor}`}>{displayYear}</span></td>
                                    <td><span style={{color: '#64748b'}}>✉️ {student.email}</span></td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedStudent(student);
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
            </div>

            {/* Add Student Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddStudent}
                title="Add Student"
                message={
                    <div className="modal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Roll Number:</label>
                                <input
                                    type="text"
                                    value={formData.roll_number}
                                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                    placeholder="S2024001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john.doe@student.edu"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="password123"
                                />
                            </div>
                        </div>
                        <div className="form-row">
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
                                <label>Batch Year:</label>
                                <select
                                    value={formData.batch_year}
                                    onChange={(e) => setFormData({ ...formData, batch_year: parseInt(e.target.value) })}
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Section:</label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                        </div>
                    </div>
                }
                confirmText="Add Student"
                confirmVariant="primary"
            />

            {/* Delete Modal */}
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