/**
 * Rooms Management Page
 * List, add, delete rooms
 */

import React, { useState, useEffect } from 'react';
import { getRooms, createRoom, deleteRoom } from '../../services/admin_service';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

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

    // Helper function to get random status for demo (in real app, status comes from backend)
    const getRandomStatus = () => {
        const statuses = ['Available', 'Occupied', 'Maintenance'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="rooms-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Rooms</h1>
                    <p>{rooms.length} rooms total</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Room
                </button>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="stat-card card-peach">
                    <span className="stat-icon" style={{color: '#8b5cf6'}}>🚪</span>
                    <span className="stat-label">Total Rooms</span>
                    <span className="stat-value">{rooms.length}</span>
                </div>
                <div className="stat-card card-green">
                    <span className="stat-icon" style={{color: '#10b981'}}>✅</span>
                    <span className="stat-label">Available</span>
                    <span className="stat-value">{Math.floor(rooms.length * 0.7)}</span>
                </div>
                <div className="stat-card card-yellow">
                    <span className="stat-icon" style={{color: '#f59e0b'}}>👥</span>
                    <span className="stat-label">Total Capacity</span>
                    <span className="stat-value">{rooms.reduce((acc, r) => acc + parseInt(r.capacity || 0), 0)}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="results-count">{filteredRooms.length} of {rooms.length} results</span>
                </div>

                <table className="data-table">
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
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'}}>
                                                🚪
                                            </div>
                                            <strong>{room.room_number}</strong>
                                        </div>
                                    </td>
                                    <td>{room.building}</td>
                                    <td>{room.floor || 'Ground'}</td>
                                    <td>{room.capacity} seats</td>
                                    <td><span className={`badge badge-${color}`}>{room.room_type}</span></td>
                                    <td>
                                        <span className={`badge badge-${statusColor}`}>
                                            <span className="status-dot"></span> {status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => {
                                                setSelectedRoom(room);
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
                {filteredRooms.length === 0 && (
                    <div className="empty-state">No rooms found</div>
                )}
            </div>

            {/* Add Room Modal */}
            <ConfirmModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onConfirm={handleAddRoom}
                title="Add New Room"
                message={
                    <div className="modal-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Room Number:</label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    placeholder="A-101"
                                />
                            </div>
                            <div className="form-group">
                                <label>Building:</label>
                                <input
                                    type="text"
                                    value={formData.building}
                                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                    placeholder="Academic Block A"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Floor:</label>
                                <input
                                    type="number"
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Capacity:</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    placeholder="50"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Room Type:</label>
                            <select
                                value={formData.room_type}
                                onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
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

            {/* Delete Modal */}
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