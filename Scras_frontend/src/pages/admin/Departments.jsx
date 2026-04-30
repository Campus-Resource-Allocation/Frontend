/**
 * Departments Management Page
 * List, add, delete departments
 */

import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, deleteDepartment } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [newDeptName, setNewDeptName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterDepartments();
    }, [searchTerm, departments]);

    const fetchDepartments = async () => {
        setLoading(true);
        const result = await getDepartments();
        if (result.success) {
            setDepartments(result.data || []);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

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

    const handleAddDepartment = async () => {
        if (!newDeptName.trim()) {
            setError('Department name is required');
            return;
        }

        const result = await createDepartment({ name: newDeptName });
        if (result.success) {
            setShowAddModal(false);
            setNewDeptName('');
            fetchDepartments();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteDepartment = async () => {
        if (!selectedDept) return;

        const result = await deleteDepartment(selectedDept.department_id);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedDept(null);
            fetchDepartments();
        } else {
            setError(result.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="departments-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Departments</h1>
                    <p>{departments.length} departments · {departments.length * 40} enrolled students</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card card-peach">
                    <span className="stat-icon">🏛️</span>
                    <span className="stat-label">Total Departments</span>
                    <span className="stat-value">{departments.length}</span>
                    <span className="stat-subtext">Active faculties</span>
                </div>
                <div className="stat-card card-green">
                    <span className="stat-icon">🎓</span>
                    <span className="stat-label">Total Students</span>
                    <span className="stat-value">1,950</span>
                    <span className="stat-subtext">Enrolled</span>
                </div>
                <div className="stat-card card-orange">
                    <span className="stat-icon">📚</span>
                    <span className="stat-label">Total Courses</span>
                    <span className="stat-value">103</span>
                    <span className="stat-subtext">Offered this semester</span>
                </div>
                <div className="stat-card card-pink">
                    <span className="stat-icon">👨‍🏫</span>
                    <span className="stat-label">Dept Heads</span>
                    <span className="stat-value">{departments.length}</span>
                    <span className="stat-subtext">Faculty leads</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredDepts.length} of {departments.length} results</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>CODE</th>
                            <th>DEPARTMENT</th>
                            <th>HEAD</th>
                            <th>STUDENTS</th>
                            <th>COURSES</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDepts.map((dept, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const students = Math.floor(Math.random() * 300) + 200;
                            const courses = Math.floor(Math.random() * 20) + 10;
                            const code = dept.name.split(' ').map(w => w[0]).join('').substring(0,4).toUpperCase();
                            return (
                                <tr key={dept.department_id}>
                                    <td><span className={`badge badge-${color}`}>{code || 'DPT'}</span></td>
                                    <td><span style={{color:'#6366f1', background:'#e0e7ff', padding:'4px 6px', borderRadius:'4px', marginRight:'8px'}}>🏛️</span> <strong>{dept.name}</strong></td>
                                    <td>Dr. Sample Name</td>
                                    <td>
                                        <div className="progress-container">
                                            <div className={`progress-line ${color}`}></div>
                                            <span>{students}</span>
                                        </div>
                                    </td>
                                    <td>{courses}</td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedDept(dept);
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
                {filteredDepts.length === 0 && (
                    <div className="empty-state">No departments found</div>
                )}
            </div>

            {/* Add Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddDepartment}
                title="Add Department"
                message={
                    <div>
                        <label>Department Name:</label>
                        <input
                            type="text"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            placeholder="e.g., Computer Science"
                            className="modal-input"
                        />
                    </div>
                }
                confirmText="Add"
                confirmVariant="primary"
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteDepartment}
                title="Delete Department"
                message={`Are you sure you want to delete "${selectedDept?.name}"? This will also delete all associated courses and schedules.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Departments;