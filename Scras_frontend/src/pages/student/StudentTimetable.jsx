/**
 * Student Timetable (My Schedule) Page
 * ✅ FIXED: Proper height based on class duration
 */

import React, { useState, useEffect } from 'react';
import { getMyTimetable, findMyCurrentClass } from '../../services/student_service';

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
  { bg: '#ecf3f0', text: '#2d6a4f', border: '#b7e4c7' },
  { bg: '#fdfcf0', text: '#b5838d', border: '#ffb4a2' },
  { bg: '#f0f4fd', text: '#1e293b', border: '#cbd5e1' },
  { bg: '#fff5f5', text: '#e53e3e', border: '#feb2b2' },
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #eef2f6',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <span style={{ color: '#64748b', fontSize: '14px' }}>
          Loading your weekly schedule...
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            My Schedule
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Weekly class schedule · {schedule.length} sessions
          </p>
        </div>

        {currentClass && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f0f4fd',
            border: '1px solid #cbd5e1',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#64748b',
                letterSpacing: '0.05em',
                marginBottom: '2px'
              }}>
                NOW IN CLASS
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                {currentClass.course_code} · {currentClass.room_number}
              </div>
            </div>
            <span style={{ fontSize: '20px', color: '#7c3aed' }}>✦</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Timetable Grid */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{
                  width: '100px',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#64748b',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  Time
                </th>
                {DAYS.map(day => {
                  const isToday = day === today;
                  return (
                    <th key={day} style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: isToday ? '#7c3aed' : '#475569',
                      borderLeft: '1px solid #e2e8f0',
                      borderBottom: '2px solid #e2e8f0',
                      background: isToday ? '#faf5ff' : 'transparent'
                    }}>
                      {day}
                      {isToday && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: '#7c3aed',
                          borderRadius: '50%',
                          margin: '6px auto 0'
                        }}></div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Time Label */}
                  <td style={{
                    padding: '16px',
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '600',
                    textAlign: 'left',
                    height: '140px', // Fixed height for 2-hour slot
                    verticalAlign: 'top',
                    background: '#fafbfc'
                  }}>
                    {fmt12(hour)}
                  </td>

                  {/* Day Cells */}
                  {DAYS.map(day => {
                    const classes = getClassesForCell(day, hour);
                    const isToday = day === today;

                    return (
                      <td key={day} style={{
                        height: '140px', // Fixed height for 2-hour slot
                        verticalAlign: 'top',
                        padding: '8px',
                        borderLeft: '1px solid #f1f5f9',
                        background: isToday ? '#fafafa' : 'transparent',
                        position: 'relative'
                      }}>
                        {classes.map((cls, i) => {
                          const colors = colorMap[cls.course_code] || COURSE_COLORS[0];
                          const isLive = currentClass?.course_code === cls.course_code;
                          const durationHours = getClassDuration(cls);
                          const heightPercent = getHeightPercentage(durationHours);

                          return (
                            <div key={i} style={{
                              background: isLive ? '#f0f4fd' : colors.bg,
                              border: `1.5px solid ${isLive ? '#7c3aed' : colors.border}`,
                              borderRadius: '10px',
                              padding: '10px',
                              height: `${heightPercent}%`, // ✅ Dynamic height based on duration
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              boxShadow: isLive ? '0 4px 12px rgba(124,58,237,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                              marginBottom: '4px',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: '800',
                                color: colors.text,
                                marginBottom: '2px'
                              }}>
                                {cls.course_code}
                              </div>

                              <div style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: colors.text,
                                opacity: 0.75,
                                marginBottom: '4px',
                                lineHeight: '1.3'
                              }}>
                                {cls.course_name}
                              </div>

                              <div style={{
                                fontSize: '10px',
                                color: '#64748b',
                                fontWeight: '600'
                              }}>
                                📍 {cls.room_number}
                              </div>

                              {isLive && (
                                <div style={{
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  color: '#7c3aed',
                                  marginTop: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <span style={{
                                    width: '6px',
                                    height: '6px',
                                    background: '#7c3aed',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite'
                                  }}></span>
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
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '24px',
          background: '#f8fafc',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#f0f4fd',
              border: '1.5px solid #7c3aed',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
              Current class
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#ecf3f0',
              border: '1.5px solid #b7e4c7',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
              Scheduled class
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#fafafa',
              border: '1.5px solid #d1d5db',
              borderRadius: '3px'
            }}></div>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
              Today's column
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default StudentTimetable;