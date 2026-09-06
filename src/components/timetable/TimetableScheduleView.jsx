import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent, DAYS_OF_WEEK } from '../../services/timetableService';
import {
  fetchStudentLogs,
  saveAttendanceLog,
  getSubjectUuid,
  getSlotUuid,
} from '../../services/attendanceService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Clock, MapPin, User, Calendar, BookOpen, Layers, Check, X, Ban } from 'lucide-react';

const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  CANCELLED: 'CANCELLED',
};

export const TimetableScheduleView = () => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || 'Computer Engineering (CE)';
  const batch = profile?.batch || 'CE1';

  const timetableData = getTimetableForStudent(branch, batch);

  // Get current day of week (1=Mon, 6=Sat)
  const currentDayId = Math.min(Math.max(new Date().getDay(), 1), 6);
  const [selectedDay, setSelectedDay] = useState(currentDayId);

  // Date selection state (default to today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [markingSlotKey, setMarkingSlotKey] = useState(null);
  const [slotUuids, setSlotUuids] = useState({});

  const daySchedule = timetableData.scheduleByDay[selectedDay] || [];

  // Resolve slot UUIDs for the selected day's schedule
  useEffect(() => {
    let isMounted = true;
    const resolveDayUuids = async () => {
      const map = {};
      for (const slot of daySchedule) {
        const uuid = await getSlotUuid(
          branch,
          slot.batchScope,
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
          slot.code
        );
        map[slot.id] = uuid;
      }
      if (isMounted) {
        setSlotUuids(map);
      }
    };
    resolveDayUuids();
    return () => { isMounted = false; };
  }, [selectedDay, branch, batch]);

  const loadLogs = async () => {
    if (!user?.id) return;
    setLoadingLogs(true);
    const fetchedLogs = await fetchStudentLogs(user.id);
    setLogs(fetchedLogs);
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadLogs();
  }, [user?.id]);

  // Helper to find marked log entry for a slot and date
  const getLogForSlot = (slot) => {
    const uuid = slotUuids[slot.id];
    if (!uuid) return null;
    return logs.find((l) => l.date === selectedDate && l.slot_id === uuid);
  };

  const handleMarkStatus = async (slot, index, status) => {
    if (!user?.id) return;
    const slotKey = `${slot.id}_${index}`;
    setMarkingSlotKey(slotKey);

    try {
      // Resolve subject & slot UUIDs deterministically
      const subjectId = await getSubjectUuid(branch, slot.code);
      const slotId = await getSlotUuid(
        branch,
        slot.batchScope,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        slot.code
      );

      const res = await saveAttendanceLog({
        studentId: user.id,
        subjectId,
        slotId,
        date: selectedDate,
        status,
      });

      const updatedLog = {
        id: res.data?.id || `local_${Date.now()}`,
        student_id: user.id,
        subject_id: subjectId,
        slot_id: slotId,
        date: selectedDate,
        status: status,
        marked_at: new Date().toISOString(),
      };

      setLogs((prev) => {
        const filtered = prev.filter(
          (l) => !(l.date === selectedDate && l.slot_id === slotId)
        );
        return [updatedLog, ...filtered];
      });
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    } finally {
      setMarkingSlotKey(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info Card */}
      <Card
        title="Weekly Timetable & Schedule"
        subtitle={`${branch} • Batch ${batch}`}
        headerAction={
          <Badge variant="success">
            {timetableData.totalSlotsCount} Weekly Slots
          </Badge>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '12px',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <BookOpen size={16} color="var(--primary-500)" />
              <span>Total Subjects</span>
            </div>
            <strong style={{ fontSize: '1.2rem', marginTop: '4px', display: 'block' }}>
              {timetableData.subjects.length}
            </strong>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Layers size={16} color="var(--color-info)" />
              <span>Branch Common</span>
            </div>
            <strong style={{ fontSize: '1.2rem', marginTop: '4px', display: 'block' }}>
              {timetableData.commonLecturesCount} Sessions
            </strong>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Calendar size={16} color="var(--color-cancelled)" />
              <span>Batch {batch} Labs</span>
            </div>
            <strong style={{ fontSize: '1.2rem', marginTop: '4px', display: 'block' }}>
              {timetableData.batchLabsCount} Labs
            </strong>
          </div>
        </div>
      </Card>

      {/* Date & Day Picker Controls */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary-500)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Date:</span>
            <input
              type="date"
              className="input-field"
              style={{ padding: '6px 10px', width: 'auto', fontSize: '0.85rem' }}
              value={selectedDate}
              onChange={(e) => {
                const dateVal = e.target.value;
                setSelectedDate(dateVal);
                if (dateVal) {
                  const d = new Date(dateVal).getDay();
                  setSelectedDay(Math.min(Math.max(d === 0 ? 7 : d, 1), 6));
                }
              }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing classes for <strong>{selectedDate}</strong>
          </div>
        </div>
      </Card>

      {/* Day Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          const slotCount = (timetableData.scheduleByDay[day.id] || []).length;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              style={{
                flex: 1,
                minWidth: '70px',
                padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (isSelected ? 'var(--primary-500)' : 'var(--border-subtle)'),
                background: isSelected ? 'var(--primary-gradient)' : 'rgba(17, 24, 39, 0.6)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{day.short}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                {slotCount} {slotCount === 1 ? 'class' : 'classes'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Schedule Slots List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {daySchedule.length === 0 ? (
          <Card>
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No classes scheduled for this day.</p>
            </div>
          </Card>
        ) : (
          daySchedule.map((slot, index) => {
            const isLab = slot.type === 'Lab';
            const isSeminar = slot.type === 'Seminar';
            const existingLog = getLogForSlot(slot, index);
            const slotKey = `${slot.id}_${index}`;
            const isMarking = markingSlotKey === slotKey;

            return (
              <Card key={slotKey} interactive>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top Bar: Time, Type Badge, and Scope Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <Clock size={16} color="var(--primary-500)" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Badge variant={isLab ? 'warning' : isSeminar ? 'info' : 'success'}>
                        {slot.type}
                      </Badge>
                      {slot.isBatchSpecific ? (
                        <Badge variant="danger">
                          Batch {slot.batchScope}
                        </Badge>
                      ) : (
                        <Badge variant="info">
                          Branch Common
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle: Subject Title & Code */}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {slot.subjectName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Code: {slot.code}
                    </span>
                  </div>

                  {/* Location & Optional Faculty */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--accent-gradient)" />
                      <span>Room/Lab: <strong>{slot.room || 'TBA'}</strong></span>
                    </div>
                    {/* Faculty display strictly if available in timetableData.js */}
                    {slot.teacher && slot.teacher.trim() !== '' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--primary-500)" />
                        <span>Faculty: <strong>{slot.teacher}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* ATTENDANCE MARKING ACTION BAR */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      {existingLog ? (
                        <Badge
                          variant={
                            existingLog.status === ATTENDANCE_STATUS.PRESENT
                              ? 'success'
                              : existingLog.status === ATTENDANCE_STATUS.ABSENT
                              ? 'danger'
                              : 'info'
                          }
                        >
                          {existingLog.status}
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Unmarked</span>
                      )}
                    </div>

                    {/* Marking Toggle Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className={`btn ${existingLog?.status === ATTENDANCE_STATUS.PRESENT ? 'btn-primary' : 'btn-ghost'}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderColor: existingLog?.status === ATTENDANCE_STATUS.PRESENT ? 'var(--color-present)' : 'var(--border-subtle)',
                          color: existingLog?.status === ATTENDANCE_STATUS.PRESENT ? '#fff' : 'var(--color-present)',
                        }}
                        disabled={isMarking}
                        onClick={() => handleMarkStatus(slot, index, ATTENDANCE_STATUS.PRESENT)}
                      >
                        <Check size={14} />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        className={`btn ${existingLog?.status === ATTENDANCE_STATUS.ABSENT ? 'btn-danger' : 'btn-ghost'}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderColor: existingLog?.status === ATTENDANCE_STATUS.ABSENT ? 'var(--color-absent)' : 'var(--border-subtle)',
                          color: existingLog?.status === ATTENDANCE_STATUS.ABSENT ? '#fff' : 'var(--color-absent)',
                        }}
                        disabled={isMarking}
                        onClick={() => handleMarkStatus(slot, index, ATTENDANCE_STATUS.ABSENT)}
                      >
                        <X size={14} />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        className={`btn ${existingLog?.status === ATTENDANCE_STATUS.CANCELLED ? 'btn-ghost' : 'btn-ghost'}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderColor: existingLog?.status === ATTENDANCE_STATUS.CANCELLED ? 'var(--color-cancelled)' : 'var(--border-subtle)',
                          color: existingLog?.status === ATTENDANCE_STATUS.CANCELLED ? 'var(--color-cancelled)' : 'var(--text-muted)',
                        }}
                        disabled={isMarking}
                        onClick={() => handleMarkStatus(slot, index, ATTENDANCE_STATUS.CANCELLED)}
                      >
                        <Ban size={14} />
                        <span>Cancelled</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
