/**
 * Student Timetable (My Schedule) Page
 * High-Fidelity Figma implementation matching screenshot 2
 * Data: Real backend integration via /student/timetable
 */

import React, { useState, useEffect } from 'react';
import { getMyTimetable, findMyCurrentClass } from '../../services/student_service';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };

// Hours from 8 AM to 4 PM (matches Figma grid)
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const fmt12 = (h) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:00\n${suffix}`;
};

// Pastel course colors matching Figma screenshot 2
const COURSE_COLORS = [
    { bg: '#ecf3f0', text: '#2d6a4f', border: '#b7e4c7' }, // Sage Green (Default)
    { bg: '#fdfcf0', text: '#b5838d', border: '#ffb4a2' }, // Pinkish
    { bg: '#f0f4fd', text: '#1e293b', border: '#cbd5e1' }, // Light Blue
    { bg: '#fff5f5', text: '#e53e3e', border: '#feb2b2' }, // Reddish
];

const StudentTimetable = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentClass, setCurrentClass] = useState(null);
    const [today, setToday] = useState('');

    useEffect(() => {
        const now = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        setToday(dayNames[now.getDay()]);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [timetableRes, currentRes] = await Promise.all([
            getMyTimetable(),
            findMyCurrentClass()
        ]);

        if (timetableRes.success) {
            setSchedule(timetableRes.data || []);
        } else {
            setError(timetableRes.message);
        }

        if (currentRes.success && currentRes.hasClass) {
            setCurrentClass(currentRes.data);
        }
        setLoading(false);
    };

    const getClassesForCell = (dayShort, hour) => {
        const dayFull = DAY_FULL[dayShort];
        return schedule.filter(item => {
            if (item.day !== dayFull) return false;
            const startH = parseInt(item.start_time?.split(':')[0] || '0');
            const endH = parseInt(item.end_time?.split(':')[0] || '0');
            return hour >= startH && hour < endH;
        });
    };

    // Stable color mapping based on course code
    const colorMap = {};
    let colorIdx = 0;
    schedule.forEach(item => {
        if (!colorMap[item.course_code]) {
            colorMap[item.course_code] = COURSE_COLORS[colorIdx % COURSE_COLORS.length];
            colorIdx++;
        }
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #eef2f6', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Loading your weekly schedule...</span>
            </div>
        );
    }

    return (
        <div>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>My Schedule</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Weekly class schedule · {schedule.length} sessions</p>
                </div>
                {currentClass && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: '#f0f4fd', border: '1px solid #cbd5e1',
                        padding: '12px 20px', borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', marginBottom: '2px' }}>NOW IN CLASS</div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                                {currentClass.course_code} · {currentClass.room_number}
                            </div>
                        </div>
                        <span style={{ fontSize: '20px', color: '#7c3aed' }}>✦</span>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
                    ⚠ {error}
                </div>
            )}

            {/* Timetable Grid - Exactly as Figma screenshot 2 */}
            <div style={{ background: '#ecf3f0', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', padding: '1px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', background: 'transparent' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px', padding: '16px', background: 'transparent' }}></th>
                                {DAYS.map(day => {
                                    const isToday = day === today;
                                    return (
                                        <th key={day} style={{
                                            padding: '16px 8px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: isToday ? '#7c3aed' : '#475569',
                                            borderLeft: '1px solid #d1dbd6'
                                        }}>
                                            {day}
                                            {isToday && <div style={{ width: '6px', height: '6px', background: '#7c3aed', borderRadius: '50%', margin: '4px auto 0' }}></div>}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => (
                                <tr key={hour} style={{ borderTop: '1px solid #d1dbd6' }}>
                                    {/* Time Label */}
                                    <td style={{
                                        padding: '12px',
                                        fontSize: '11px',
                                        color: '#64748b',
                                        fontWeight: '700',
                                        whiteSpace: 'pre-line',
                                        textAlign: 'center',
                                        height: '90px',
                                        verticalAlign: 'top'
                                    }}>
                                        {fmt12(hour)}
                                    </td>

                                    {/* Day Cells */}
                                    {DAYS.map(day => {
                                        const classes = getClassesForCell(day, hour);
                                        return (
                                            <td key={day} style={{
                                                height: '90px',
                                                verticalAlign: 'top',
                                                padding: '6px',
                                                borderLeft: '1px solid #d1dbd6',
                                                background: 'transparent'
                                            }}>
                                                {classes.map((cls, i) => {
                                                    const colors = colorMap[cls.course_code] || COURSE_COLORS[0];
                                                    const isLive = currentClass?.course_code === cls.course_code;
                                                    return (
                                                        <div key={i} style={{
                                                            background: isLive ? '#f0f4fd' : colors.bg,
                                                            border: `1px solid ${isLive ? '#7c3aed' : colors.border}`,
                                                            borderRadius: '10px',
                                                            padding: '10px',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            boxShadow: isLive ? '0 4px 12px rgba(124,58,237,0.1)' : 'none'
                                                        }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '800', color: colors.text }}>{cls.course_code}</div>
                                                            <div style={{ fontSize: '11px', fontWeight: '600', color: colors.text, opacity: 0.8, marginTop: '2px' }}>{cls.course_name}</div>
                                                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>{cls.room_number}</div>
                                                            {isLive && (
                                                                <div style={{ fontSize: '9px', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>● LIVE</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Legend matching Figma */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #d1dbd6', display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#f0f4fd', border: '1px solid #7c3aed', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Current class</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ecf3f0', border: '1px solid #b7e4c7', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Scheduled class</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#fdfcf0', border: '1px solid #ffb4a2', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Today</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StudentTimetable;
