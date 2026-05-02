/**
 * TAs Management Page
 * List, add, delete Teaching Assistants
 */

import React, { useState, useEffect } from 'react';
import { getTAs, createTA, deleteTA } from '../../services/admin_service';
import { getDepartments, getTeachers } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

const TAs = () => {
    const [tas, setTAs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]); // ✅ Added
    const [filteredTAs, setFilteredTAs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTA, setSelectedTA] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'password123',
        roll_number: '', // ✅ Added
        department_id: '',
        teacher_email: '' // ✅ Changed from teacher_id
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterTAs();
    }, [searchTerm, tas]);

    const fetchData = async () => {
        setLoading(true);
        const [tasRes, deptsRes, teachersRes] = await Promise.all([
            getTAs(),
            getDepartments(),
            getTeachers() // ✅ Added
        ]);

        if (tasRes.success) {
            setTAs(tasRes.data || []);
        }
        if (deptsRes.success) {
            setDepartments(deptsRes.data || []);
        }
        if (teachersRes.success) {
            setTeachers(teachersRes.data || []); // ✅ Added
        }
        setLoading(false);
    };

    const filterTAs = () => {
        if (!searchTerm) {
            setFilteredTAs(tas);
        } else {
            const filtered = tas.filter(ta =>
                ta.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ta.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ta.roll_number?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTAs(filtered);
        }
    };

    const handleAddTA = async () => {
        console.log("📤 Form data before validation:", formData);

        if (!formData.name || !formData.email || !formData.roll_number || !formData.department_id || !formData.teacher_email) {
            setError('All fields are required');
            return;
        }

        // ✅ Convert department_id to integer
        const dataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roll_number: formData.roll_number,
            department_id: parseInt(formData.department_id),
            teacher_email: formData.teacher_email
        };

        console.log("📤 Data being sent to backend:", dataToSend);

        const result = await createTA(dataToSend);
        
        console.log("📬 Response from backend:", result);

        if (result.success) {
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                password: 'password123',
                roll_number: '',
                department_id: '',
                teacher_email: ''
            });
            setError('');
            fetchData();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteTA = async () => {
        if (!selectedTA) return;

        const result = await deleteTA(selectedTA.ta_id);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedTA(null);
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
                    <h1>Teaching Assistants</h1>
                    <p>{tas.length} TAs currently assisting</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add TA
                </button>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="stat-card card-blue">
                    <span className="stat-icon" style={{color: '#3b82f6'}}>🎓</span>
                    <span className="stat-label">Total TAs</span>
                    <span className="stat-value">{tas.length}</span>
                </div>
                <div className="stat-card card-green">
                    <span className="stat-icon" style={{color: '#10b981'}}>✅</span>
                    <span className="stat-label">Active Support</span>
                    <span className="stat-value">{tas.length}</span>
                </div>
                <div className="stat-card card-pink">
                    <span className="stat-icon" style={{color: '#ec4899'}}>🛠️</span>
                    <span className="stat-label">Assigned Labs</span>
                    <span className="stat-value">{Math.floor(tas.length * 1.5)}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search TAs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredTAs.length} of {tas.length} results</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>TA MEMBER</th>
                            <th>ROLL NUMBER</th>
                            <th>DEPARTMENT</th>
                            <th>SUPERVISOR</th>
                            <th>EMAIL</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTAs.map((ta, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const initials = ta.name ? ta.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'TA';
                            
                            return (
                                <tr key={ta.ta_id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                                                {initials}
                                            </div>
                                            <strong>{ta.name}</strong>
                                        </div>
                                    </td>
                                    <td>{ta.roll_number}</td>
                                    <td><span className={`badge badge-${color}`}>{ta.department_name || 'N/A'}</span></td>
                                    <td><span style={{color: '#64748b'}}>👨‍🏫 {ta.teacher_name || 'N/A'}</span></td>
                                    <td><span style={{color: '#64748b'}}>✉️ {ta.email}</span></td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedTA(ta);
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
                {filteredTAs.length === 0 && (
                    <div className="empty-state">No TAs found</div>
                )}
            </div>

            {/* Add TA Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setError('');
                }}
                onConfirm={handleAddTA}
                title="Add Teaching Assistant"
                message={
                    <div className="modal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Saad"
                                />
                            </div>
                            <div className="form-group">
                                <label>Roll Number:</label>
                                <input
                                    type="text"
                                    value={formData.roll_number}
                                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                    placeholder="24L-0823"
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
                                    placeholder="l240823@lhr.nu.edu.pk"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
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
                            <div className="form-group">
                                <label>Supervisor Teacher:</label>
                                <select
                                    value={formData.teacher_email}
                                    onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.teacher_id} value={teacher.email}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                }
                confirmText="Add TA"
                confirmVariant="primary"
            />

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTA}
                title="Delete TA"
                message={`Are you sure you want to delete "${selectedTA?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default TAs;