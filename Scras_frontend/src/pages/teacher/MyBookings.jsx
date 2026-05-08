/**
 * My Bookings Page (Teacher/TA)
 * Polished to match Figma design system (lavender/pastel)
 */

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/auth_service';
import * as teacherService from '../../services/teacher_service';
import * as taService from '../../services/ta_service';
import styles from './MyBookings.module.css';

const statusConfig = {
    Confirmed: { label: "Approved", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", icon: "✓" },
    Pending: { label: "Pending Review", bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", icon: "◷" },
    Cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", icon: "✕" },
    Rejected: { label: "Rejected", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", icon: "✕" },
    Approved: { label: "Approved", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", icon: "✓" },
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

    useEffect(() => { 
        console.log("🎬 Component Mounted - MyBookings");
        console.log("👤 Current User:", user);
        console.log("🎭 User Role:", user?.role);
        console.log("🔧 Service Selected:", user?.role?.toLowerCase() === "ta" ? "TA Service" : "Teacher Service");
        loadBookings(); 
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        console.log("🚀 Loading bookings...");
        console.log("📝 Current User:", user);
        console.log("🔧 Selected Service:", service === taService ? 'TA Service' : 'Teacher Service');
        
        const data = await service.getMyBookings();
        
        console.log("📬 Service Response:", data);
        console.log("✅ Success:", data?.success);
        console.log("📋 Data:", data?.data);
        console.log("🔢 Bookings Count:", data?.data?.length || 0);
        
        setLoading(false);
        
        if (data?.success) {
            const bookingsData = data.data || [];
            setBookings(bookingsData);
            console.log("✨ Bookings Set Successfully:", bookingsData);
            console.log("📊 Total bookings in state:", bookingsData.length);
        } else {
            setBookings([]);
            console.log("⚠️ No bookings or error:", data?.message);
            setMessage({ 
                text: data?.message || "Could not load bookings", 
                type: "error" 
            });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", { 
            weekday: 'short', month: "short", day: "numeric", year: "numeric" 
        });
    };

    const counts = {
        approved: bookings.filter(b => b.status === 'Confirmed' || b.status === 'Approved').length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length,
    };

    console.log("📊 Current Stats:", counts);
    console.log("📋 Current Bookings in State:", bookings);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>My Bookings</h1>
                    <p>Track and manage your room reservation requests</p>
                </div>
                <button 
                    onClick={() => onPageChange('room-finder')}
                    className={styles.bookBtn}
                >
                    <span>+</span> Book New Room
                </button>
            </div>

            {message.text && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    <span>{message.text}</span>
                    <button 
                        onClick={() => setMessage({ text: "", type: "" })}
                        className={styles.closeBtn}
                    >×</button>
                </div>
            )}

            {/* Stats Bar */}
            <div className={styles.statsGrid}>
                {[
                    { label: "Approved", value: counts.approved, ...statusConfig.Confirmed },
                    { label: "Pending Review", value: counts.pending, ...statusConfig.Pending },
                    { label: "Cancelled", value: counts.cancelled, ...statusConfig.Cancelled },
                ].map((s) => (
                    <div key={s.label} className={styles.statCard}>
                        <div className={styles.statIconWrapper} style={{ background: s.bg, color: s.color, border: `1px solid ${s.dot}20` }}>
                            {s.icon}
                        </div>
                        <div>
                            <p className={styles.statValue} style={{ color: s.color, textShadow: `0 2px 4px ${s.color}20` }}>{s.value}</p>
                            <p className={styles.statLabel}>
                                {s.label.toUpperCase()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div className={styles.spinner}></div>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Fetching your reservations...</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    {bookings.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📅</div>
                            <p style={{ fontSize: "16px", fontWeight: 600 }}>No reservations found</p>
                            <p style={{ fontSize: "14px" }}>Any rooms you book will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead className={styles.tableHeader}>
                                    <tr>
                                        {["ROOM", "DATE & TIME", "PURPOSE", "STATUS"].map((col) => (
                                            <th key={col}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, idx) => {
                                        const sc = statusConfig[booking.status] || statusConfig.Pending;
                                        return (
                                            <tr key={booking.booking_id || idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div className={styles.roomCell}>
                                                        <span style={{ fontSize: '20px' }}>
                                                            {roomTypeIcons[booking.room_type] || '🏛️'}
                                                        </span>
                                                        <div>
                                                            <div className={styles.roomNumber}>
                                                                {booking.room_number}
                                                            </div>
                                                            <div className={styles.roomType}>
                                                                {booking.room_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <div className={styles.dateTimeCell}>
                                                        <span className={styles.dateText}>
                                                            {formatDate(booking.booking_date)}
                                                        </span>
                                                        <span className={styles.timeText}>
                                                            {booking.start_time} – {booking.end_time}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <span className={styles.purposeText}>
                                                        {booking.purpose}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "20px 24px" }}>
                                                    <span className={styles.statusBadge} style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.dot}20` }}>
                                                        <span className={styles.statusDot} style={{ background: sc.dot }} />
                                                        {sc.label}
                                                    </span>
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
        </div>
    );
}