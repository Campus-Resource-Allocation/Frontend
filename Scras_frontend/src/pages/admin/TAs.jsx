/**
 * TAs Management Page
 * List, add, delete Teaching Assistants
 */

import React, { useState, useEffect } from 'react';
import { getTAs, createTA, deleteTA, getDepartments, getTeachers } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './TAs.module.css';

const TAs = () => {
    const [tas, setTAs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
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
        roll_number: '',
        department_id: '',
        teacher_email: ''
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
            getTeachers()
        ]);

        if (tasRes.success) setTAs(tasRes.data || []);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
        if (teachersRes.success) setTeachers(teachersRes.data || []);
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
        if (!formData.name || !formData.email || !formData.roll_number || !formData.department_id || !formData.teacher_email) {
            setError('All fields are required');
            return;
        }

        const dataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roll_number: formData.roll_number,
            department_id: parseInt(formData.department_id),
            teacher_email: formData.teacher_email
        };

        const result = await createTA(dataToSend);
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
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Teaching Assistants</h1>
                    <p>{tas.length} TAs currently assisting</p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{
                    padding: '10px 20px', borderRadius: '12px', background: 'var(--admin-accent)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer'
                }}>+ Add TA</button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🎓</span>
                    <span className={styles.statLabel}>Total TAs</span>
                    <span className={styles.statValue}>{tas.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statLabel}>Active Support</span>
                    <span className={styles.statValue}>{tas.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🛠️</span>
                    <span className={styles.statLabel}>Assigned Labs</span>
                    <span className={styles.statValue}>{Math.floor(tas.length * 1.5)}</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search TAs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className={styles.resultsCount}>{filteredTAs.length} of {tas.length} results</span>
                </div>

                <table className={styles.dataTable}>
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
                            const initials = ta.name ? ta.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TA';

                            return (
                                <tr key={ta.ta_id}>
                                    <td>
                                        <div className={styles.taCell}>
                                            <div className={styles.avatar} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>
                                                {initials}
                                            </div>
                                            <strong>{ta.name}</strong>
                                        </div>
                                    </td>
                                    <td>{ta.roll_number}</td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>{ta.department_name || 'N/A'}</span></td>
                                    <td><span className={styles.mutedText}>{ta.teacher_name || 'N/A'}</span></td>
                                    <td><span className={styles.mutedText}>{ta.email}</span></td>
                                    <td>
                                        <button onClick={() => { setSelectedTA(ta); setShowDeleteModal(true); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredTAs.length === 0 && (
                    <div className={styles.emptyState}>No TAs found</div>
                )}
            </div>

            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setError(''); }}
                onConfirm={handleAddTA}
                title="Add Teaching Assistant"
                message={
                    <div className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Saad"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Roll Number:</label>
                                <input
                                    type="text"
                                    value={formData.roll_number}
                                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                                    placeholder="24L-0823"
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
                                    placeholder="l240823@lhr.nu.edu.pk"
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
                            <div className={styles.formGroup}>
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