/**
 * My Bookings Page (Teacher/TA)
 * Polished to match Figma design system (lavender/pastel)
 */

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/auth_service';
import * as teacherService from '../../services/teacher_service';
import * as taService from '../../services/ta_service';

const statusConfig = {
    Confirmed: { label: "Approved", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", icon: "✓" },
    Pending: { label: "Pending Review", bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", icon: "◷" },
    Cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", icon: "✕" },
};

const roomTypeIcons = {
    "Class Room": "📚",
    "Computer Lab": "💻",
    "Seminar Hall": "🎭",
    "Robotics Lab": "🤖",
    "Electrical lab": "⚡",
    "English Lab": "🗣️",
};

export default function MyBookings({ onPageChange }) {
    const user = getCurrentUser();
    const service = user?.role?.toLowerCase() === "ta" ? taService : teacherService;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => { loadBookings(); }, [service]);

    const loadBookings = async () => {
        setLoading(true);
        const data = await service.getMyBookings();
        setLoading(false);
        if (data?.success) setBookings(data.data || []);
        else setBookings([]);
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        const data = await service.cancelBooking(bookingId);
        if (data?.success) {
            setMessage({ text: "Success! Your booking has been cancelled.", type: "success" });
            setBookings((prev) => prev.map((b) => b.booking_id === bookingId ? { ...b, status: "Cancelled" } : b));
        } else {
            setMessage({ text: data?.message || "Failed to cancel booking.", type: "error" });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { 
            weekday: 'short', month: "short", day: "numeric", year: "numeric" 
        });
    };

    const counts = {
        approved: bookings.filter(b => b.status === 'Confirmed').length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };

    return (
        <div style={{ padding: "0" }}>
            <div style={{ marginBottom: "32px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>My Bookings</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Track and manage your room reservation requests</p>
                </div>
                <button 
                    onClick={() => onPageChange('room-finder')}
                    style={{ 
                        background: '#7c3aed', 
                        color: 'white', 
                        padding: '12px 24px', 
                        borderRadius: '12px', 
                        border: 'none', 
                        fontWeight: '700', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 20px -3px rgba(124, 58, 237, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(124, 58, 237, 0.3)'; }}
                >
                    <span style={{ fontSize: '18px', fontWeight: '400' }}>+</span> Book New Room
                </button>
            </div>

            {message.text && (
                <div style={{ 
                    padding: "14px 20px", borderRadius: "12px", marginBottom: "24px", 
                    background: message.type === "success" ? "#f0fdf4" : "#fef2f2", 
                    border: `1px solid ${message.type === "success" ? "#dcfce7" : "#fecaca"}`, 
                    color: message.type === "success" ? "#15803d" : "#b91c1c", 
                    fontSize: "14px", fontWeight: 600
                }}>
                    {message.text}
                </div>
            )}

            {/* Stats Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
                {[
                    { label: "Approved", value: counts.approved, ...statusConfig.Confirmed },
                    { label: "Pending Review", value: counts.pending, ...statusConfig.Pending },
                    { label: "Cancelled", value: counts.cancelled, ...statusConfig.Cancelled },
                ].map((s) => (
                    <div key={s.label} style={{ 
                        background: "white", border: "1px solid #e2e8f0", borderRadius: "20px", 
                        padding: "24px", display: "flex", alignItems: "center", gap: "20px",
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ 
                            width: "48px", height: "48px", borderRadius: "14px", 
                            background: s.bg, display: "flex", alignItems: "center", 
                            justifyContent: "center", fontSize: "20px", color: s.color,
                            border: `1px solid ${s.dot}20`
                        }}>{s.icon}</div>
                        <div>
                            <p style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", margin: 0 }}>{s.value}</p>
                            <p style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>{s.label.toUpperCase()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #f1f5f9', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>Fetching your reservations...</p>
                </div>
            ) : (
                <div style={{ background: "white", border: "1px solid #eef2f6", borderRadius: "24px", overflow: "hidden", boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    {bookings.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                            <p style={{ fontSize: "16px", fontWeight: 600 }}>No reservations found</p>
                            <p style={{ fontSize: "14px" }}>Any rooms you book will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                        {["ROOM", "DATE & TIME", "PURPOSE", "STATUS", "ACTION"].map((col) => (
                                            <th key={col} style={{ textAlign: "left", padding: "16px 24px", fontSize: "11px", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.06em" }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, idx) => {
                                        const sc = statusConfig[booking.status] || statusConfig.Pending;
                                        return (
                                            <tr key={booking.booking_id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <span style={{ fontSize: '20px' }}>{roomTypeIcons[booking.room_type] || '🏛️'}</span>
                                                        <div>
                                                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{booking.room_number}</div>
                                                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{booking.room_type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{formatDate(booking.booking_date)}</div>
                                                    <div style={{ fontSize: "12px", color: "#64748b" }}>{booking.start_time} – {booking.end_time}</div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <span style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>{booking.purpose}</span>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <span style={{ 
                                                        display: "inline-flex", alignItems: "center", gap: "6px", 
                                                        padding: "5px 12px", borderRadius: "20px", 
                                                        background: sc.bg, color: sc.color, 
                                                        fontSize: "11px", fontWeight: 700,
                                                        border: `1px solid ${sc.dot}20`
                                                    }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot }} />
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    {booking.status === "Pending" && (
                                                        <button onClick={() => handleCancel(booking.booking_id)} style={{ 
                                                            padding: "6px 14px", borderRadius: "10px", 
                                                            background: "#fff1f2", color: "#e11d48", 
                                                            fontSize: "12px", fontWeight: 700, 
                                                            border: "1px solid #fecdd3", cursor: "pointer",
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "#e11d48"; e.currentTarget.style.color = "white"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#e11d48"; }}>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
