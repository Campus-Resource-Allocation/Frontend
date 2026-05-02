/**
 * Room Finder Page (Teacher/TA)
 * With hourly time slot selection
 */

import React, { useState } from 'react';
import { getCurrentUser } from '../../services/auth_service';
import * as teacherService from '../../services/teacher_service';
import * as taService from '../../services/ta_service';

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
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.4)", backdropFilter: 'blur(4px)' }}>
            <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "24px", padding: "32px", boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Reserve Room {room.room_number}</h3>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>{room.building} · Capacity: {room.capacity}</p>
                
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.05em" }}>PURPOSE OF BOOKING</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", outline: "none", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b", fontSize: "14px", fontWeight: '500' }}>
                        <option value="">Select purpose...</option>
                        <option value="Makeup Class">Makeup Class</option>
                        <option value="Assignment Evaluation">Assignment Evaluation</option>
                        <option value="Lab Session">Lab Session</option>
                        <option value="Quiz/Test">Quiz / Test</option>
                    </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.05em" }}>SELECTED DATE</label>
                    <input type="text" value={bookingDate} readOnly style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", outline: "none", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px", fontWeight: '600' }} />
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.05em" }}>TIME RANGE</label>
                    <input type="text" value={timeRange} readOnly style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", outline: "none", background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px", fontWeight: '600' }} />
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                        {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''} selected
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#f1f5f9", color: "#64748b", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => onConfirm(purpose)} disabled={loading || !purpose} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: purpose ? "#7c3aed" : "#ddd6fe", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: purpose ? "pointer" : "not-allowed", transition: 'all 0.2s' }}>
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
        <div style={{ padding: "0" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Room Finder</h1>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Find and reserve available space for your academic sessions</p>
            </div>

            {message.text && (
                <div style={{ 
                    padding: "14px 20px", borderRadius: "12px", marginBottom: "24px", 
                    background: message.type === "success" ? "#f0fdf4" : "#fef2f2", 
                    border: `1px solid ${message.type === "success" ? "#dcfce7" : "#fecaca"}`, 
                    color: message.type === "success" ? "#15803d" : "#b91c1c", 
                    fontSize: "14px", fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <span>{message.type === 'success' ? '✓' : '⚠'}</span>
                    {message.text}
                </div>
            )}

            {/* Filter Bar */}
            <div style={{ 
                background: "white", border: "1px solid #e2e8f0", borderRadius: "20px", 
                padding: "24px", marginBottom: "24px",
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "20px", marginBottom: "20px", alignItems: "end" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.05em" }}>ROOM TYPE</label>
                        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", outline: "none", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b", fontSize: "13px", fontWeight: '600' }}>
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
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.05em" }}>BOOKING DATE</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", outline: "none", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#1e293b", fontSize: "13px", fontWeight: '600' }} />
                    </div>
                    <button onClick={handleSearch} style={{ padding: "12px 28px", borderRadius: "12px", background: "#7c3aed", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", height: '44px', transition: 'all 0.2s' }}>
                        Find Rooms
                    </button>
                </div>

                {/* Time Slots Selection */}
                <div>
                    <label style={{ display: "block", marginBottom: "12px", fontSize: "11px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.05em" }}>
                        SELECT TIME SLOTS {selectedSlots.length > 0 && `(${selectedSlots.length} selected)`}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                        {TIME_SLOTS.map((slot) => {
                            const isSelected = selectedSlots.includes(slot.id);
                            return (
                                <label key={slot.id} style={{ 
                                    display: "flex", alignItems: "center", gap: "10px", 
                                    padding: "10px 14px", borderRadius: "10px", 
                                    background: isSelected ? "#f3e8ff" : "#f8fafc", 
                                    border: `1.5px solid ${isSelected ? "#7c3aed" : "#e2e8f0"}`,
                                    cursor: "pointer", transition: 'all 0.2s',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "#cbd5e1"; }}
                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => handleSlotToggle(slot.id)}
                                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#7c3aed" }}
                                    />
                                    <span style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "#7c3aed" : "#475569" }}>
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
                    <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>Checking room availability...</p>
                </div>
            )}

            {!loading && rooms.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                    {rooms.map((room) => {
                        const isBooked = bookedIds.includes(room.room_id);
                        const tc = typeColors[room.room_type] || "#8b5cf6";
                        return (
                            <div key={room.room_id} style={{ 
                                background: "white", border: `1px solid ${isBooked ? "#dcfce7" : "#eef2f6"}`, 
                                borderRadius: "20px", overflow: "hidden", 
                                boxShadow: isBooked ? '0 10px 15px -3px rgba(34,197,94,0.05)' : '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ height: "4px", background: tc }} />
                                <div style={{ padding: "24px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                                <span style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b" }}>{room.room_number}</span>
                                                <span style={{ padding: "2px 8px", borderRadius: "6px", background: `${tc}15`, color: tc, fontSize: "10px", fontWeight: 700 }}>{room.room_type}</span>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                                                📍 {room.building} · Floor {room.floor}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: "4px 10px", borderRadius: "20px", 
                                            background: isBooked ? "#f0fdf4" : "#f1f5f9", 
                                            color: isBooked ? "#16a34a" : "#64748b", 
                                            fontSize: "11px", fontWeight: 700,
                                            border: `1px solid ${isBooked ? "#dcfce7" : "#e2e8f0"}`
                                        }}>
                                            {isBooked ? "✓ Confirmed" : "Available"}
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: "flex", alignItems: "center", gap: "12px", 
                                        padding: "12px", borderRadius: "12px", background: "#f8fafc", 
                                        marginBottom: "24px" 
                                    }}>
                                        <span style={{ fontSize: '18px' }}>👥</span>
                                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{room.capacity}</span>
                                        <span style={{ fontSize: "13px", color: "#64748b" }}>Max Capacity</span>
                                    </div>

                                    {isBooked ? (
                                        <div style={{ 
                                            width: "100%", padding: "12px", borderRadius: "12px", 
                                            background: "#f0fdf4", color: "#16a34a", 
                                            fontSize: "14px", fontWeight: 700, textAlign: "center", 
                                            border: "1px solid #dcfce7" 
                                        }}>
                                            Request Sent
                                        </div>
                                    ) : (
                                        <button onClick={() => setModalRoom(room)} style={{ 
                                            width: "100%", padding: "12px", borderRadius: "12px", 
                                            background: "white", color: "#7c3aed", 
                                            fontSize: "14px", fontWeight: 700, border: "1px solid #ddd6fe", 
                                            cursor: "pointer", transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "white"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#7c3aed"; }}>
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
            
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}