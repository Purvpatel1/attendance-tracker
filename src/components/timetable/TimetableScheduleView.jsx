import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimetableForStudent } from '../../services/timetableService';
import {
  fetchStudentLogs,
  saveAttendanceLog,
  getSubjectUuid,
  getSlotUuid,
  getLogForSlotHour,
  getLogForExtraLectureHour,
  getKolkataTodayDateString,
  getDayOfWeekFromDateString,
  calculateAttendanceMetrics,
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
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleClassItem } from './ScheduleClassItem';
import { Calendar } from 'lucide-react';

export const TimetableScheduleView = () => {
  const { user, profile } = useAuth();
  const branch = profile?.branch || '';
  const batch = profile?.batch || '';

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
  const [subjectsWithIds, setSubjectsWithIds] = useState([]);

  // Extra Lectures state
  const [extraLectures, setExtraLectures] = useState([]);
  const [eligibleSubjects, setEligibleSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);

  const daySchedule = timetableData.scheduleByDay[selectedDay] || [];

  // Filter extra lectures for the selected date
  const dailyExtraLectures = extraLectures.filter((el) => el.date === selectedDate);

  // Helper to check if a class time slot is currently ongoing
  const isTimeSlotOngoing = (dateStr, startTime, endTime) => {
    if (dateStr !== todayStr) return false;
    try {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(now);
      const hr = parts.find((p) => p.type === 'hour')?.value || '0';
      const min = parts.find((p) => p.type === 'minute')?.value || '0';
      const currentMinutes = parseInt(hr, 10) * 60 + parseInt(min, 10);

      const parseMinutes = (tStr) => {
        if (!tStr) return 0;
        const [h, m] = tStr.slice(0, 5).split(':').map(Number);
        return h * 60 + m;
      };

      const startMins = parseMinutes(startTime);
      const endMins = parseMinutes(endTime);

      return currentMinutes >= startMins && currentMinutes < endMins;
    } catch (e) {
      return false;
    }
  };

  // Resolve subject UUIDs for live metrics calculation
  useEffect(() => {
    let isMounted = true;
    const resolveSubjectUuids = async () => {
      const resolved = await Promise.all(
        (timetableData.subjects || []).map(async (sub) => {
          const id = await getSubjectUuid(branch, sub.code);
          return { ...sub, id, target_percentage: 75 };
        })
      );
      if (isMounted) {
        setSubjectsWithIds(resolved);
      }
    };
    resolveSubjectUuids();
    return () => {
      isMounted = false;
    };
  }, [branch, batch]);

  // Derive live attendance metrics per subject from existing logs & subjects
  const { subjectMetrics } = calculateAttendanceMetrics(subjectsWithIds, logs);

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

  const loadData = async (showLoading = true) => {
    if (!user?.id) return;
    if (showLoading) setLoadingLogs(true);
    const [fetchedLogs, fetchedExtra] = await Promise.all([
      fetchStudentLogs(user.id),
      fetchExtraLecturesForStudent(user.id),
    ]);
    setLogs(fetchedLogs);
    setExtraLectures(fetchedExtra);
    if (showLoading) setLoadingLogs(false);
  };

  useEffect(() => {
    loadData(true);

    const handleGlobalUpdate = () => {
      loadData(false);
    };

    window.addEventListener('attendance-updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('attendance-updated', handleGlobalUpdate);
    };
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
  const handleMarkStatus = async (slot, hourIndex, targetStatus) => {
    if (!user?.id) return;
    const slotKey = `${slot.id}_h${hourIndex}`;
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
    <div className="schedule-view-container">
      {/* Streamlined Schedule Header */}
      <ScheduleHeader
        selectedDate={selectedDate}
        selectedDay={selectedDay}
        onSelectDate={setSelectedDate}
        onSelectDay={setSelectedDay}
        onOpenExtraModal={() => {
          setEditingLecture(null);
          setIsModalOpen(true);
        }}
        timetableData={timetableData}
      />

      {/* Timeline Schedule List */}
      <div className="schedule-timeline-list">
        {/* Render Extra Lectures first if any exist for target date */}
        {dailyExtraLectures.map((lecture) => {
          const subjectMeta =
            lecture.subjects || eligibleSubjects.find((s) => s.id === lecture.subject_id) || {};
          const hoursList = expandExtraLectureToHourlyUnits(lecture);
          const isOngoing = isTimeSlotOngoing(selectedDate, lecture.start_time, lecture.end_time);
          const subjectMetric = subjectMetrics.find((m) => m.id === lecture.subject_id);

          return (
            <ScheduleClassItem
              key={`extra_${lecture.id}`}
              classData={lecture}
              isExtra={true}
              isOngoing={isOngoing}
              subjectMeta={subjectMeta}
              subjectMetric={subjectMetric}
              hoursList={hoursList}
              markingSlotKey={markingSlotKey}
              getLogForExtraHourLocal={getLogForExtraHourLocal}
              onMarkExtraStatus={handleMarkExtraStatus}
              onEditExtra={(lec) => {
                setEditingLecture(lec);
                setIsModalOpen(true);
              }}
              onDeleteExtra={handleDeleteExtraLecture}
            />
          );
        })}

        {/* Render Regular Scheduled Slots for the selected day */}
        {daySchedule.map((slot, index) => {
          const hoursList =
            slot.hours || [{ hourIndex: 1, label: `${slot.startTime} - ${slot.endTime}` }];
          const isOngoing = isTimeSlotOngoing(selectedDate, slot.startTime, slot.endTime);
          const subjectMetric = subjectMetrics.find((m) => m.code === slot.code);

          return (
            <ScheduleClassItem
              key={`slot_${slot.id}_${index}`}
              classData={slot}
              isExtra={false}
              isOngoing={isOngoing}
              subjectMetric={subjectMetric}
              hoursList={hoursList}
              slotUuids={slotUuids}
              markingSlotKey={markingSlotKey}
              getLogForSlotHourLocal={getLogForSlotHourLocal}
              onMarkStatus={handleMarkStatus}
            />
          );
        })}

        {/* Empty State */}
        {daySchedule.length === 0 && dailyExtraLectures.length === 0 && (
          <div className="editorial-empty-state">
            <Calendar size={28} className="empty-icon" />
            <p className="empty-title">
              {selectedDay === 0
                ? 'No classes scheduled on Sunday.'
                : 'No classes scheduled for this day.'}
            </p>
          </div>
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

