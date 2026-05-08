/**
 * Rooms Management Page
 * List, add, delete rooms
 */

import React, { useState, useEffect } from 'react';
import { getRooms, createRoom, deleteRoom } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './Rooms.module.css';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_number: '',
        building: '',
        floor: '',
        capacity: '',
        room_type: 'Class Room'
    });
    const [error, setError] = useState('');

    const roomTypes = ['Class Room', 'Lab', 'Seminar Hall', 'Computer Lab', 'Robotics Lab', 'Electrical lab'];

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        filterRooms();
    }, [searchTerm, rooms]);

    const fetchRooms = async () => {
        setLoading(true);
        const result = await getRooms();
        if (result.success) {
            setRooms(result.data || []);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const filterRooms = () => {
        if (!searchTerm) {
            setFilteredRooms(rooms);
        } else {
            const filtered = rooms.filter(room =>
                room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.room_type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRooms(filtered);
        }
    };

    const handleAddRoom = async () => {
        if (!formData.room_number || !formData.building || !formData.capacity) {
            setError('Room number, building, and capacity are required');
            return;
        }

        const result = await createRoom({
            ...formData,
            floor: parseInt(formData.floor) || 0,
            capacity: parseInt(formData.capacity)
        });

        if (result.success) {
            setShowAddModal(false);
            setFormData({
                room_number: '',
                building: '',
                floor: '',
                capacity: '',
                room_type: 'Class Room'
            });
            fetchRooms();
        } else {
            setError(result.message);
        }
    };

    const handleDeleteRoom = async () => {
        if (!selectedRoom) return;

        const result = await deleteRoom(selectedRoom.room_id);
        if (result.success) {
            setShowDeleteModal(false);
            setSelectedRoom(null);
            fetchRooms();
        } else {
            setError(result.message);
        }
    };

    const getRandomStatus = () => {
        const statuses = ['Available', 'Occupied', 'Maintenance'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Rooms</h1>
                    <p>{rooms.length} rooms total</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🚪</span>
                    <span className={styles.statLabel}>Total Rooms</span>
                    <span className={styles.statValue}>{rooms.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statLabel}>Available</span>
                    <span className={styles.statValue}>{Math.floor(rooms.length * 0.7)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>👥</span>
                    <span className={styles.statLabel}>Total Capacity</span>
                    <span className={styles.statValue}>{rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0)}</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeaderActions}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className={styles.resultsCount}>{filteredRooms.length} of {rooms.length} results</span>
                    <button className={styles.addBtn} onClick={() => setShowAddModal(true)} style={{
                        padding: '10px 20px', borderRadius: '12px', background: 'var(--admin-accent)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer'
                    }}>+ Add Room</button>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>ROOM</th>
                            <th>BUILDING</th>
                            <th>FLOOR</th>
                            <th>CAPACITY</th>
                            <th>TYPE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map((room, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            const status = getRandomStatus();
                            const statusColor = status === 'Available' ? 'green' : status === 'Occupied' ? 'orange' : 'pink';

                            return (
                                <tr key={room.room_id}>
                                    <td>
                                        <div className={styles.roomCell}>
                                            <div className={styles.roomIcon} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>
                                                🚪
                                            </div>
                                            <strong>{room.room_number}</strong>
                                        </div>
                                    </td>
                                    <td>{room.building}</td>
                                    <td>{room.floor || 'Ground'}</td>
                                    <td>{room.capacity} seats</td>
                                    <td><span className={styles.badge} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark)` }}>{room.room_type}</span></td>
                                    <td>
                                        <span className={styles.badge} style={{ background: `var(--card-${statusColor})`, color: `var(--text-${statusColor}-dark)` }}>
                                            <span className={styles.statusDot}></span> {status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => { setSelectedRoom(room); setShowDeleteModal(true); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredRooms.length === 0 && (
                    <div className={styles.emptyState}>No rooms found</div>
                )}
            </div>

            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddRoom}
                title="Add New Room"
                message={
                    <div className={styles.modalForm}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Room Number:</label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    placeholder="A-101"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Building:</label>
                                <input
                                    type="text"
                                    value={formData.building}
                                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                    placeholder="Academic Block A"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Floor:</label>
                                <input
                                    type="number"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Capacity:</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    placeholder="50"
                                />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Room Type:</label>
                            <select
                                value={formData.room_type}
                                onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                                className={styles.select}
                            >
                                {roomTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
                confirmText="Add Room"
                confirmVariant="primary"
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteRoom}
                title="Delete Room"
                message={`Are you sure you want to delete room "${selectedRoom?.room_number}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default Rooms;