/**
 * Student Class Finder Page
 * High-Fidelity Figma implementation matching screenshot 1
 * Data: Real backend integration via /student/timetable
 * ✅ FIXED: Refactored inline CSS to CSS Modules
 */

import React, { useState, useEffect } from 'react';
import { getMyTimetable, findMyCurrentClass } from '../../services/student_service';
import styles from './StudentClassFinder.module.css';

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
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <span className={styles.subtitle}>Syncing with campus records...</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Area */}
            <div className={styles.header}>
                <h1 className={styles.title}>Class Locator</h1>
                <p className={styles.subtitle}>Find your classes and their locations</p>
            </div>

            {/* Search Input - Matching Figma pill shape */}
            <div className={styles.searchContainer}>
                <div className={styles.searchIcon}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by course code, name, or instructor..."
                    className={styles.searchInput}
                />
            </div>

            {error && (
                <div className={styles.errorBox}>
                    ⚠ {error}
                </div>
            )}

            {/* Course Cards Grid */}
            <div className={styles.cardsGrid}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        No enrolled courses found in database.
                    </div>
                ) : (
                    filtered.map((course, idx) => {
                        const hColor = HEADER_COLORS[idx % HEADER_COLORS.length];
                        const isCurrent = currentClass?.course_code === course.course_code;

                        return (
                            <div key={idx} className={styles.courseCard}>
                                {/* Card Header with Color Bar */}
                                <div className={styles.cardHeaderTopLine} style={{ background: hColor.main }}></div>
                                <div className={styles.cardHeaderContent}>
                                    <div>
                                        <div className={styles.courseCodeWrapper}>
                                            <span className={styles.courseCode} style={{ color: hColor.main }}>{course.course_code}</span>
                                            <span className={styles.sectionBadge} style={{ color: hColor.main, background: `${hColor.main}15` }}>
                                                Section {course.section}
                                            </span>
                                        </div>
                                        <h3 className={styles.courseName}>{course.course_name}</h3>
                                    </div>
                                    <div className={styles.enrollBadge} style={{
                                        background: isCurrent ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-sidebar-active, #f8fafc)',
                                        border: `1px solid ${isCurrent ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color, #f1f5f9)'}`
                                    }}>
                                        <span className={styles.enrollDot} style={{ background: isCurrent ? '#22c55e' : 'var(--text-muted)' }}></span>
                                        <span className={styles.enrollText} style={{ color: isCurrent ? '#4ade80' : 'var(--text-muted, #64748b)' }}>
                                            {isCurrent ? 'Enrolled' : 'Enrolled'}
                                        </span>
                                    </div>
                                </div>

                                {/* Detail Boxes - Matching Figma soft mint background */}
                                <div className={styles.detailsGrid}>
                                    {[
                                        { label: 'ROOM', value: course.room_number, icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/> },
                                        { label: 'BUILDING', value: course.building, icon: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/> },
                                        { label: 'TIME', value: formatTime(course.start_time, course.end_time), icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                                        { label: 'DAYS', value: formatDays(course.days), icon: <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/> },
                                    ].map((box, bi) => (
                                        <div key={bi} className={styles.detailBox}>
                                            <div className={styles.detailBoxHeader}>
                                                <svg width="14" height="14" fill="none" stroke="currentColor" style={{color: 'var(--text-muted)'}} strokeWidth="2" viewBox="0 0 24 24">{box.icon}</svg>
                                                <span className={styles.detailBoxLabel}>{box.label}</span>
                                            </div>
                                            <div className={styles.detailBoxValue}>{box.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Instructor Footer */}
                                <div className={styles.instructorFooter}>
                                    <div className={styles.instructorIconWrapper} style={{ background: `${hColor.main}20`, color: hColor.main }}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </div>
                                    <span className={styles.instructorName}>{course.instructor}</span>
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
