/**
 * Room Finder Page (Teacher/TA)
 * With hourly time slot selection
 */

import React, { useState } from 'react';
import { getCurrentUser } from '../../services/auth_service';
import * as teacherService from '../../services/teacher_service';
import * as taService from '../../services/ta_service';
import styles from './RoomFinder.module.css';

const typeColors = {
    "Class Room": "#6366F1",
    "Computer Lab": "#0EA5E9",
    "Seminar Hall": "#8B5CF6",
    "Robotics Lab": "#10B981",
    "Electrical lab": "#F59E0B",
    "English Lab": "#EC4899",
};

// Generate hourly slots from 8 AM to 8 PM
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
        const displayStart = hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
        const displayEnd = (hour + 1) === 12 ? "12:00 PM" : (hour + 1) > 12 ? `${hour + 1 - 12}:00 PM` : `${hour + 1}:00 AM`;
        
        slots.push({
            id: hour,
            startTime,
            endTime,
            display: `${displayStart} - ${displayEnd}`
        });
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

function BookingModal({ room, bookingDate, selectedSlots, onConfirm, onCancel, loading }) {
    const [purpose, setPurpose] = useState("");
    
    // Get first and last selected slot for display
    const firstSlot = TIME_SLOTS.find(s => s.id === Math.min(...selectedSlots));
    const lastSlot = TIME_SLOTS.find(s => s.id === Math.max(...selectedSlots));
    
    const timeRange = firstSlot && lastSlot 
        ? `${firstSlot.display.split(' - ')[0]} - ${lastSlot.display.split(' - ')[1]}`
        : '';

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Reserve Room {room.room_number}</h3>
                <p className={styles.modalSub}>{room.building} · Capacity: {room.capacity}</p>
                
                <div style={{ marginBottom: "20px" }}>
                    <label className={styles.filterLabel}>PURPOSE OF BOOKING</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={styles.select}>
                        <option value="">Select purpose...</option>
                        <option value="Makeup Class">Makeup Class</option>
                        <option value="Assignment Evaluation">Assignment Evaluation</option>
                        <option value="Lab Session">Lab Session</option>
                        <option value="Quiz/Test">Quiz / Test</option>
                    </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label className={styles.filterLabel}>SELECTED DATE</label>
                    <input type="text" value={bookingDate} readOnly className={styles.input} style={{ background: 'var(--bg-page)', opacity: 0.7 }} />
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <label className={styles.filterLabel}>TIME RANGE</label>
                    <input type="text" value={timeRange} readOnly className={styles.input} style={{ background: 'var(--bg-page)', opacity: 0.7 }} />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                        {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} selected
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={onCancel} className={styles.browseBtn} style={{ flex: 1 }}>Cancel</button>
                    <button 
                        onClick={() => onConfirm(purpose)} 
                        disabled={loading || !purpose} 
                        className={styles.searchBtn}
                        style={{ flex: 1, opacity: !purpose ? 0.5 : 1 }}
                    >
                        {loading ? "Processing..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RoomFinder() {
    const user = getCurrentUser();
    const service = user?.role?.toLowerCase() === "ta" ? taService : teacherService;

    const [selectedType, setSelectedType] = useState("All");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [bookedIds, setBookedIds] = useState([]);
    const [modalRoom, setModalRoom] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const handleSlotToggle = (slotId) => {
        setSelectedSlots(prev => {
            if (prev.includes(slotId)) {
                return prev.filter(id => id !== slotId);
            } else {
                return [...prev, slotId].sort((a, b) => a - b);
            }
        });
    };

    const handleSearch = async () => {
        if (!selectedDate || selectedSlots.length === 0) {
            setMessage({ text: "Please select a date and at least one time slot", type: "error" });
            return;
        }
        
        setLoading(true);
        setMessage({ text: "", type: "" });
        
        // Get start time of first slot and end time of last slot
        const firstSlot = TIME_SLOTS.find(s => s.id === Math.min(...selectedSlots));
        const lastSlot = TIME_SLOTS.find(s => s.id === Math.max(...selectedSlots));
        
        const data = await service.searchAvailableRooms(
            selectedType, 
            selectedDate, 
            firstSlot.startTime,
            lastSlot.endTime
        );
        
        setLoading(false);
        setSearched(true);
        
        if (data?.success) {
            setRooms(data.data);
            if (data.data.length === 0) {
                setMessage({ text: "No rooms available for this selection.", type: "error" });
            }
        } else {
            setMessage({ text: data.message, type: "error" });
        }
    };

    const confirmBooking = async (purpose) => {
        if (!purpose) return;
        
        setBookingLoading(true);
        
        // Get start time of first slot and end time of last slot
        const firstSlot = TIME_SLOTS.find(s => s.id === Math.min(...selectedSlots));
        const lastSlot = TIME_SLOTS.find(s => s.id === Math.max(...selectedSlots));
        
        const data = await service.bookRoom(
            modalRoom.room_id, 
            selectedDate,
            firstSlot.startTime,
            lastSlot.endTime,
            purpose
        );
        
        setBookingLoading(false);
        
        if (data?.success) {
            setBookedIds((prev) => [...prev, modalRoom.room_id]);
            setMessage({ text: "Success! Your booking request is now pending admin approval.", type: "success" });
        } else {
            setMessage({ text: data?.message || "Booking failed.", type: "error" });
        }
        setModalRoom(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Room Finder</h1>
                <p>Find and reserve available space for your academic sessions</p>
            </div>

            {message.text && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                    {message.text}
                </div>
            )}

            {/* Filter Bar */}
            <div className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div>
                        <label className={styles.filterLabel}>ROOM TYPE</label>
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={styles.select}>
                            <option value="All">All Types</option>
                            <option value="Class Room">Class Room</option>
                            <option value="Computer Lab">Computer Lab</option>
                            <option value="Seminar Hall">Seminar Hall</option>
                            <option value="Robotics Lab">Robotics Lab</option>
                            <option value="Electrical lab">Electrical lab</option>
                            <option value="English Lab">English Lab</option>
                        </select>
                    </div>
                    <div>
                        <label className={styles.filterLabel}>BOOKING DATE</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.input} />
                    </div>
                    <button onClick={handleSearch} className={styles.searchBtn}>
                        Find Rooms
                    </button>
                </div>

                {/* Time Slots Selection */}
                <div>
                    <label className={styles.filterLabel}>
                        SELECT TIME SLOTS {selectedSlots.length > 0 && `(${selectedSlots.length} selected)`}
                    </label>
                    <div className={styles.slotsGrid}>
                        {TIME_SLOTS.map((slot) => {
                            const isSelected = selectedSlots.includes(slot.id);
                            return (
                                <label key={slot.id} className={`${styles.slotLabel} ${isSelected ? styles.slotLabelActive : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => handleSlotToggle(slot.id)}
                                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#7c3aed" }}
                                    />
                                    <span className={`${styles.slotLabelText} ${isSelected ? styles.slotLabelTextActive : ''}`}>
                                        {slot.display}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div className={styles.spinner}></div>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Checking room availability...</p>
                </div>
            )}

            {!loading && rooms.length > 0 && (
                <div className={styles.roomsGrid}>
                    {rooms.map((room) => {
                        const isBooked = bookedIds.includes(room.room_id);
                        const tc = typeColors[room.room_type] || "#8b5cf6";
                        return (
                            <div key={room.room_id} className={`${styles.roomCard} ${isBooked ? styles.roomCardBooked : ''}`}>
                                <div style={{ height: "4px", background: tc }} />
                                <div className={styles.roomCardContent}>
                                    <div className={styles.roomHeader}>
                                        <div>
                                            <div className={styles.roomTitle}>
                                                <span className={styles.roomNumber}>{room.room_number}</span>
                                                <span className={styles.roomBadge} style={{ background: `${tc}15`, color: tc }}>{room.room_type}</span>
                                            </div>
                                            <div className={styles.roomSub}>
                                                📍 {room.building} · Floor {room.floor}
                                            </div>
                                        </div>
                                        <div className={`${styles.statusBadge} ${isBooked ? styles.statusBadgeBooked : ''}`}>
                                            {isBooked ? "✓ Confirmed" : "Available"}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.capacityBar}>
                                        <span style={{ fontSize: '18px' }}>👥</span>
                                        <span className={styles.capacityText}>{room.capacity}</span>
                                        <span className={styles.capacityLabel}>Max Capacity</span>
                                    </div>

                                    {isBooked ? (
                                        <div className={styles.sentBadge}>
                                            Request Sent
                                        </div>
                                    ) : (
                                        <button onClick={() => setModalRoom(room)} className={styles.bookBtn}>
                                            Book This Room
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && searched && rooms.length === 0 && !message.text && (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                    <p style={{ fontSize: "16px", fontWeight: 600 }}>No available rooms found</p>
                    <p style={{ fontSize: "14px" }}>Try adjusting your date or time slot filters.</p>
                </div>
            )}

            {modalRoom && (
                <BookingModal 
                    room={modalRoom} 
                    bookingDate={selectedDate}
                    selectedSlots={selectedSlots}
                    onConfirm={confirmBooking} 
                    onCancel={() => setModalRoom(null)} 
                    loading={bookingLoading} 
                />
            )}
        </div>
    );
}