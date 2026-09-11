import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent, DAYS_OF_WEEK } from '../../services/timetableService';
import {
  fetchStudentLogs,
  saveAttendanceLog,
  getSubjectUuid,
  getSlotUuid,
  getLogForSlotHour,
  getLogForExtraLectureHour,
  getKolkataTodayDateString,
  getDayOfWeekFromDateString,
} from '../../services/attendanceService';
import {
  fetchExtraLecturesForStudent,
  createExtraLecture,
  updateExtraLecture,
  deleteExtraLecture,
  expandExtraLectureToHourlyUnits,
  fetchEligibleSubjects,
} from '../../services/extraLectureService';
import { AddExtraLectureModal } from './AddExtraLectureModal';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen,
  Layers,
  Check,
  X,
  Ban,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

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

  // Date selection state (default to Asia/Kolkata today YYYY-MM-DD)
  const todayStr = getKolkataTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Initial selected day based on Asia/Kolkata date (0=Sun, 1=Mon, ..., 6=Sat)
  const initialDayId = getDayOfWeekFromDateString(todayStr);
  const [selectedDay, setSelectedDay] = useState(initialDayId);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [markingSlotKey, setMarkingSlotKey] = useState(null);
  const [slotUuids, setSlotUuids] = useState({});

  // Extra Lectures state
  const [extraLectures, setExtraLectures] = useState([]);
  const [eligibleSubjects, setEligibleSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);

  const daySchedule = timetableData.scheduleByDay[selectedDay] || [];

  // Filter extra lectures for the selected date
  const dailyExtraLectures = extraLectures.filter((el) => el.date === selectedDate);

  // Resolve eligible curriculum subjects for the student (branch + batch scope)
  useEffect(() => {
    let isMounted = true;
    const resolveCurriculumSubjects = async () => {
      const resolved = await fetchEligibleSubjects(branch, batch);
      if (isMounted) {
        setEligibleSubjects(resolved);
      }
    };

    resolveCurriculumSubjects();
    return () => {
      isMounted = false;
    };
  }, [branch, batch]);

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
    return () => {
      isMounted = false;
    };
  }, [selectedDay, branch, batch]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoadingLogs(true);
    const [fetchedLogs, fetchedExtra] = await Promise.all([
      fetchStudentLogs(user.id),
      fetchExtraLecturesForStudent(user.id),
    ]);
    setLogs(fetchedLogs);
    setExtraLectures(fetchedExtra);
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Helper to find marked log entry for a recurring slot, date, and hourIndex
  const getLogForSlotHourLocal = (slot, hourIndex = 1) => {
    const uuid = slotUuids[slot.id];
    if (!uuid) return null;
    return getLogForSlotHour(logs, selectedDate, uuid, hourIndex);
  };

  // Helper to find marked log entry for an extra lecture, date, and hourIndex
  const getLogForExtraHourLocal = (extraLectureId, hourIndex = 1) => {
    return getLogForExtraLectureHour(logs, selectedDate, extraLectureId, hourIndex);
  };

  // Mark status for recurring slot
  const handleMarkStatus = async (slot, index, hourIndex, targetStatus) => {
    if (!user?.id) return;
    const slotKey = `${slot.id}_${index}_h${hourIndex}`;
    setMarkingSlotKey(slotKey);

    try {
      const subjectId = await getSubjectUuid(branch, slot.code);
      const slotId = await getSlotUuid(
        branch,
        slot.batchScope,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        slot.code
      );

      const existingLog = getLogForSlotHourLocal(slot, hourIndex);
      const newStatus = existingLog?.status === targetStatus ? 'UNMARKED' : targetStatus;

      const res = await saveAttendanceLog({
        studentId: user.id,
        subjectId,
        slotId,
        extraLectureId: null,
        date: selectedDate,
        hourIndex: hourIndex,
        status: newStatus,
      });

      if (!res.success) {
        console.warn('Could not save attendance log:', res.error);
        alert(`Could not save attendance log: ${res.error || 'Unknown error'}`);
        return;
      }

      if (newStatus === 'UNMARKED') {
        setLogs((prev) =>
          prev.filter(
            (l) =>
              !(
                l.date === selectedDate &&
                l.slot_id === slotId &&
                Number(l.hour_index || 1) === Number(hourIndex)
              )
          )
        );
      } else {
        const updatedLog = {
          id: res.data?.id || `local_${Date.now()}`,
          student_id: user.id,
          subject_id: subjectId,
          slot_id: slotId,
          extra_lecture_id: null,
          date: selectedDate,
          hour_index: hourIndex,
          status: newStatus,
          marked_at: new Date().toISOString(),
        };

        setLogs((prev) => {
          const filtered = prev.filter(
            (l) =>
              !(
                l.date === selectedDate &&
                l.slot_id === slotId &&
                Number(l.hour_index || 1) === Number(hourIndex)
              )
          );
          return [updatedLog, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to mark hourly attendance:', err);
    } finally {
      setMarkingSlotKey(null);
    }
  };

  // Mark status for extra lecture
  const handleMarkExtraStatus = async (extraLecture, hourIndex, targetStatus) => {
    if (!user?.id) return;
    const slotKey = `extra_${extraLecture.id}_h${hourIndex}`;
    setMarkingSlotKey(slotKey);

    try {
      const existingLog = getLogForExtraHourLocal(extraLecture.id, hourIndex);
      const newStatus = existingLog?.status === targetStatus ? 'UNMARKED' : targetStatus;

      const res = await saveAttendanceLog({
        studentId: user.id,
        subjectId: extraLecture.subject_id,
        slotId: null,
        extraLectureId: extraLecture.id,
        date: selectedDate,
        hourIndex: hourIndex,
        status: newStatus,
      });

      if (!res.success) {
        console.warn('Could not save extra lecture attendance log:', res.error);
        alert(`Could not save extra lecture attendance log: ${res.error || 'Unknown error'}`);
        return;
      }

      if (newStatus === 'UNMARKED') {
        setLogs((prev) =>
          prev.filter(
            (l) =>
              !(
                l.date === selectedDate &&
                l.extra_lecture_id === extraLecture.id &&
                Number(l.hour_index || 1) === Number(hourIndex)
              )
          )
        );
      } else {
        const updatedLog = {
          id: res.data?.id || `local_extra_${Date.now()}`,
          student_id: user.id,
          subject_id: extraLecture.subject_id,
          slot_id: null,
          extra_lecture_id: extraLecture.id,
          date: selectedDate,
          hour_index: hourIndex,
          status: newStatus,
          marked_at: new Date().toISOString(),
        };

        setLogs((prev) => {
          const filtered = prev.filter(
            (l) =>
              !(
                l.date === selectedDate &&
                l.extra_lecture_id === extraLecture.id &&
                Number(l.hour_index || 1) === Number(hourIndex)
              )
          );
          return [updatedLog, ...filtered];
        });
      }
    } catch (err) {
      console.error('Failed to mark extra lecture attendance:', err);
    } finally {
      setMarkingSlotKey(null);
    }
  };

  // Save Extra Lecture handler (Create or Update)
  const handleSaveExtraLecture = async (payload) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    let res;
    if (payload.id) {
      res = await updateExtraLecture({
        id: payload.id,
        studentId: user.id,
        subjectId: payload.subjectId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    } else {
      res = await createExtraLecture({
        studentId: user.id,
        subjectId: payload.subjectId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    }

    if (res.success) {
      await loadData();
    }
    return res;
  };

  // Delete Extra Lecture handler
  const handleDeleteExtraLecture = async (extraLecture) => {
    if (!user?.id || !extraLecture?.id) return;

    const lectureLogs = logs.filter(
      (l) => l.extra_lecture_id === extraLecture.id && l.status !== 'UNMARKED'
    );

    let confirmMsg = 'Are you sure you want to delete this extra class?';
    if (lectureLogs.length > 0) {
      confirmMsg = `Deleting this extra class will delete ${lectureLogs.length} marked attendance record(s). Do you want to proceed?`;
    }

    if (!window.confirm(confirmMsg)) return;

    const res = await deleteExtraLecture(extraLecture.id, user.id);
    if (res.success) {
      setExtraLectures((prev) => prev.filter((el) => el.id !== extraLecture.id));
      setLogs((prev) => prev.filter((l) => l.extra_lecture_id !== extraLecture.id));
    } else {
      alert(`Could not delete extra lecture: ${res.error}`);
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

      {/* Date & Day Picker Controls Bar + Add Extra Class Action */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                    setSelectedDay(getDayOfWeekFromDateString(dateVal));
                  }
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingLecture(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Add Extra Class</span>
            </button>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing classes for <strong>{selectedDate}</strong>
            </div>
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

      {/* Extra Lectures Section (if any for selected date) */}
      {dailyExtraLectures.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#facc15', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            <span>Extra Classes on {selectedDate} ({dailyExtraLectures.length})</span>
          </div>

          {dailyExtraLectures.map((lecture) => {
            const subject = lecture.subjects || eligibleSubjects.find((s) => s.id === lecture.subject_id) || {};
            const hoursList = expandExtraLectureToHourlyUnits(lecture);

            return (
              <Card key={lecture.id} interactive>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top Bar: Time, Extra Class Badge, Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <Clock size={16} color="#facc15" />
                      <span>{lecture.start_time?.slice(0, 5)} - {lecture.end_time?.slice(0, 5)}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        ({hoursList.length} {hoursList.length === 1 ? 'hour' : 'hours'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant="warning">Extra Class</Badge>
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                        title="Edit Extra Class"
                        onClick={() => {
                          setEditingLecture(lecture);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-absent)', cursor: 'pointer', padding: '4px' }}
                        title="Delete Extra Class"
                        onClick={() => handleDeleteExtraLecture(lecture)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Subject Title & Code */}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {subject.name || 'Extra Lecture'}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Code: {subject.code || 'N/A'} • Type: {subject.type || 'Lecture'}
                    </span>
                  </div>

                  {/* HOURLY ATTENDANCE MARKING CONTROLS FOR EXTRA CLASS */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    {hoursList.map((hObj) => {
                      const existingLog = getLogForExtraHourLocal(lecture.id, hObj.hourIndex);
                      const slotKey = `extra_${lecture.id}_h${hObj.hourIndex}`;
                      const isMarking = markingSlotKey === slotKey;

                      return (
                        <div
                          key={hObj.hourIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: hoursList.length > 1 ? '6px 8px' : '0px',
                            background: hoursList.length > 1 ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {hoursList.length > 1 ? hObj.label : 'Status:'}
                            </span>
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
                              onClick={() => handleMarkExtraStatus(lecture, hObj.hourIndex, ATTENDANCE_STATUS.PRESENT)}
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
                              onClick={() => handleMarkExtraStatus(lecture, hObj.hourIndex, ATTENDANCE_STATUS.ABSENT)}
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
                              onClick={() => handleMarkExtraStatus(lecture, hObj.hourIndex, ATTENDANCE_STATUS.CANCELLED)}
                            >
                              <Ban size={14} />
                              <span>Cancelled</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Daily Schedule Slots List (Recurring Weekly Timetable) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {daySchedule.length === 0 && dailyExtraLectures.length === 0 ? (
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
            const hoursList = slot.hours || [{ hourIndex: 1, label: `${slot.startTime} - ${slot.endTime}` }];

            return (
              <Card key={`${slot.id}_${index}`} interactive>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top Bar: Time, Type Badge, and Scope Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <Clock size={16} color="var(--primary-500)" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                        ({slot.duration || 1} {slot.duration === 1 ? 'hour' : 'hours'})
                      </span>
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
                    {slot.teacher && slot.teacher.trim() !== '' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--primary-500)" />
                        <span>Faculty: <strong>{slot.teacher}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* HOURLY ATTENDANCE MARKING CONTROLS */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    {hoursList.map((hObj) => {
                      const existingLog = getLogForSlotHourLocal(slot, hObj.hourIndex);
                      const slotKey = `${slot.id}_${index}_h${hObj.hourIndex}`;
                      const isMarking = markingSlotKey === slotKey;

                      return (
                        <div
                          key={hObj.hourIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                            padding: hoursList.length > 1 ? '6px 8px' : '0px',
                            background: hoursList.length > 1 ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {hoursList.length > 1 ? hObj.label : 'Status:'}
                            </span>
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
                              onClick={() => handleMarkStatus(slot, index, hObj.hourIndex, ATTENDANCE_STATUS.PRESENT)}
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
                              onClick={() => handleMarkStatus(slot, index, hObj.hourIndex, ATTENDANCE_STATUS.ABSENT)}
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
                              onClick={() => handleMarkStatus(slot, index, hObj.hourIndex, ATTENDANCE_STATUS.CANCELLED)}
                            >
                              <Ban size={14} />
                              <span>Cancelled</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit Extra Lecture Modal */}
      <AddExtraLectureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLecture(null);
        }}
        onSave={handleSaveExtraLecture}
        eligibleSubjects={eligibleSubjects}
        editingLecture={editingLecture}
        existingLogs={logs}
      />
    </div>
  );
};
