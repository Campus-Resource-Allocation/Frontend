/**
 * Student Class Finder Page
 * High-Fidelity Figma implementation matching screenshot 1
 * Data: Real backend integration via /student/timetable
 */

import React, { useState, useEffect } from 'react';
import { getMyTimetable, findMyCurrentClass } from '../../services/student_service';

const StudentClassFinder = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [currentClass, setCurrentClass] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [timetableResult, currentResult] = await Promise.all([
            getMyTimetable(),
            findMyCurrentClass()
        ]);

        if (currentResult.success && currentResult.hasClass) {
            setCurrentClass(currentResult.data);
        }

        if (timetableResult.success) {
            const data = timetableResult.data || [];
            const courseMap = {};
            data.forEach(item => {
                const key = `${item.course_code}-${item.section}`;
                if (!courseMap[key]) {
                    courseMap[key] = {
                        course_code: item.course_code,
                        course_name: item.course_name,
                        section: item.section,
                        room_number: item.room_number,
                        building: item.building || 'Campus',
                        instructor: item.teacher_name || item.instructor || 'TBD',
                        days: [],
                        start_time: item.start_time,
                        end_time: item.end_time,
                    };
                }
                if (item.day && !courseMap[key].days.includes(item.day)) {
                    courseMap[key].days.push(item.day);
                }
            });
            setCourses(Object.values(courseMap));
        } else {
            setError(timetableResult.message);
        }
        setLoading(false);
    };

    const formatDays = (days) => {
        const dayMap = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' };
        return days.map(d => dayMap[d] || d).join(', ');
    };

    const formatTime = (start, end) => {
        if (!start || !end) return 'TBD';
        const fmt = t => {
            const [h, m] = t.split(':');
            const hr = parseInt(h);
            const suffix = hr >= 12 ? 'PM' : 'AM';
            return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${suffix}`;
        };
        return `${fmt(start)} – ${fmt(end)}`;
    };

    const filtered = courses.filter(c =>
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(search.toLowerCase())
    );

    // Header Colors from Figma
    const HEADER_COLORS = [
        { main: '#3b82f6', bg: '#eff6ff' }, // Blue
        { main: '#06b6d4', bg: '#ecfeff' }, // Cyan
        { main: '#10b981', bg: '#f0fdf4' }, // Green
        { main: '#8b5cf6', bg: '#f5f3ff' }, // Purple
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #eef2f6', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Syncing with campus records...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '0' }}>
            {/* Header Area */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Class Locator</h1>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Find your classes and their locations</p>
            </div>

            {/* Search Input - Matching Figma pill shape */}
            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{
                    position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
                    color: '#94a3b8', display: 'flex'
                }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by course code, name, or instructor..."
                    style={{
                        width: '100%', padding: '15px 20px 15px 52px',
                        background: '#f1f5f9', border: 'none', borderRadius: '14px',
                        fontSize: '14px', color: '#334155', outline: 'none'
                    }}
                />
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>
                    ⚠ {error}
                </div>
            )}

            {/* Course Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
                        No enrolled courses found in database.
                    </div>
                ) : (
                    filtered.map((course, idx) => {
                        const hColor = HEADER_COLORS[idx % HEADER_COLORS.length];
                        const isCurrent = currentClass?.course_code === course.course_code;

                        return (
                            <div key={idx} style={{
                                background: 'white',
                                borderRadius: '20px',
                                border: '1px solid #eef2f6',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}>
                                {/* Card Header with Color Bar */}
                                <div style={{ height: '3px', background: hColor.main }}></div>
                                <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '15px', fontWeight: '800', color: hColor.main }}>{course.course_code}</span>
                                            <span style={{ fontSize: '11px', fontWeight: '700', color: hColor.main, background: `${hColor.main}15`, padding: '2px 8px', borderRadius: '6px' }}>
                                                Section {course.section}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{course.course_name}</h3>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: isCurrent ? '#f0fdf4' : '#f8fafc',
                                        padding: '5px 12px', borderRadius: '20px',
                                        border: `1px solid ${isCurrent ? '#dcfce7' : '#f1f5f9'}`
                                    }}>
                                        <span style={{ width: '6px', height: '6px', background: isCurrent ? '#22c55e' : '#cbd5e1', borderRadius: '50%' }}></span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: isCurrent ? '#15803d' : '#64748b' }}>
                                            {isCurrent ? 'Enrolled' : 'Enrolled'}
                                        </span>
                                    </div>
                                </div>

                                {/* Detail Boxes - Matching Figma soft mint background */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px 24px' }}>
                                    {[
                                        { label: 'ROOM', value: course.room_number, icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/> },
                                        { label: 'BUILDING', value: course.building, icon: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/> },
                                        { label: 'TIME', value: formatTime(course.start_time, course.end_time), icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                                        { label: 'DAYS', value: formatDays(course.days), icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/> },
                                    ].map((box, bi) => (
                                        <div key={bi} style={{ background: '#ecf3f0', padding: '14px 16px', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">{box.icon}</svg>
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em' }}>{box.label}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{box.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Instructor Footer */}
                                <div style={{ padding: '12px 24px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%', background: `${hColor.main}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: hColor.main
                                    }}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{course.instructor}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StudentClassFinder;
