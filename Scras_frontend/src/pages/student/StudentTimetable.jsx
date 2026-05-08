/**
 * Student Timetable (My Schedule) Page
 * ✅ FIXED: Proper height based on class duration
 * ✅ FIXED: Refactored inline CSS to CSS Modules
 */

import React, { useState, useEffect } from 'react';
import { getMyTimetable, findMyCurrentClass } from '../../services/student_service';
import styles from './StudentTimetable.module.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday'
};

// 2-hour slots
const HOURS = [8, 10, 12, 14, 16];

const fmt12 = (h) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:00 ${suffix}`;
};

const COURSE_COLORS = [
  { bg: 'var(--course-1-bg, #ecf3f0)', text: 'var(--course-1-text, #2d6a4f)', border: 'var(--course-1-border, #b7e4c7)' },
  { bg: 'var(--course-2-bg, #fdfcf0)', text: 'var(--course-2-text, #b5838d)', border: 'var(--course-2-border, #ffb4a2)' },
  { bg: 'var(--course-3-bg, #f0f4fd)', text: 'var(--course-3-text, #1e293b)', border: 'var(--course-3-border, #cbd5e1)' },
  { bg: 'var(--course-4-bg, #fff5f5)', text: 'var(--course-4-text, #e53e3e)', border: 'var(--course-4-border, #feb2b2)' },
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

    try {
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
    } catch (err) {
      setError('Failed to load timetable');
    }

    setLoading(false);
  };

  const parseTimeToHour = (isoString) => {
    if (!isoString) return 0;
    const date = new Date(isoString);
    return date.getUTCHours();
  };

  const parseTimeToMinutes = (isoString) => {
    if (!isoString) return 0;
    const date = new Date(isoString);
    return date.getUTCMinutes();
  };

  /**
   * ✅ Check if class falls in this 2-hour slot
   */
  const getClassesForCell = (dayShort, slotStartHour) => {
    const dayFull = DAY_FULL[dayShort];
    const slotEndHour = slotStartHour + 2; // 2-hour slot

    return schedule.filter(item => {
      if (item.day !== dayFull) return false;

      const startH = parseTimeToHour(item.start_time);
      const endH = parseTimeToHour(item.end_time);

      // Class overlaps with this 2-hour slot
      return startH < slotEndHour && endH > slotStartHour;
    });
  };

  /**
   * ✅ Calculate class duration in hours (decimal)
   * Example: 1.5 hours, 2 hours, 1 hour
   */
  const getClassDuration = (cls) => {
    const start = new Date(cls.start_time);
    const end = new Date(cls.end_time);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  };

  /**
   * ✅ Calculate height percentage based on duration
   * 2 hrs → 100%, 1.5 hrs → 75%, 1 hr → 50%
   */
  const getHeightPercentage = (durationInHours) => {
    const slotDuration = 2; // Each slot is 2 hours
    const percentage = (durationInHours / slotDuration) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Color mapping
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.subtitle}>Loading your weekly schedule...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Schedule</h1>
          <p className={styles.subtitle}>Weekly class schedule · {schedule.length} sessions</p>
        </div>

        {currentClass && (
          <div className={styles.nowInClass}>
            <div>
              <div className={styles.nowInClassLabel}>NOW IN CLASS</div>
              <div className={styles.nowInClassValue}>
                {currentClass.course_code} · {currentClass.room_number}
              </div>
            </div>
            <span className={styles.nowInClassIcon}>✦</span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorBox}>
          ⚠ {error}
        </div>
      )}

      {/* Timetable Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.trHeader}>
                <th className={styles.thTime}>Time</th>
                {DAYS.map(day => {
                  const isToday = day === today;
                  return (
                    <th key={day} className={`${styles.thDay} ${isToday ? styles.thDayToday : ''}`}>
                      {day}
                      {isToday && <div className={styles.todayIndicator}></div>}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className={styles.trRow}>
                  {/* Time Label */}
                  <td className={styles.tdTime}>{fmt12(hour)}</td>

                  {/* Day Cells */}
                  {DAYS.map(day => {
                    const classes = getClassesForCell(day, hour);
                    const isToday = day === today;

                    return (
                      <td key={day} className={`${styles.tdDay} ${isToday ? styles.tdDayToday : ''}`}>
                        {classes.map((cls, i) => {
                          const colors = colorMap[cls.course_code] || COURSE_COLORS[0];
                          const isLive = currentClass?.course_code === cls.course_code;
                          const durationHours = getClassDuration(cls);
                          const heightPercent = getHeightPercentage(durationHours);

                          return (
                            <div key={i} 
                              className={`${styles.classCard} ${isLive ? styles.classCardLive : styles.classCardNormal}`}
                              style={{
                                background: isLive ? 'var(--bg-sidebar-active)' : colors.bg,
                                border: `1.5px solid ${isLive ? '#7c3aed' : colors.border}`,
                                height: `${heightPercent}%`
                              }}>
                              <div className={styles.courseCode} style={{ color: colors.text }}>
                                {cls.course_code}
                              </div>

                              <div className={styles.courseName} style={{ color: colors.text }}>
                                {cls.course_name}
                              </div>

                              <div className={styles.roomNumber}>
                                📍 {cls.room_number}
                              </div>

                              {isLive && (
                                <div className={styles.liveIndicator}>
                                  <span className={styles.pulseDot}></span>
                                  LIVE NOW
                                </div>
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

        {/* Footer Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div style={{ width: '12px', height: '12px', background: '#f0f4fd', border: '1.5px solid #7c3aed', borderRadius: '3px' }}></div>
            <span className={styles.legendText}>Current class</span>
          </div>

          <div className={styles.legendItem}>
            <div style={{ width: '12px', height: '12px', background: '#ecf3f0', border: '1.5px solid #b7e4c7', borderRadius: '3px' }}></div>
            <span className={styles.legendText}>Scheduled class</span>
          </div>

          <div className={styles.legendItem}>
            <div style={{ width: '12px', height: '12px', background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', borderRadius: '3px' }}></div>
            <span className={styles.legendText}>Today's column</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;