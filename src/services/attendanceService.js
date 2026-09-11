import { supabase } from '../lib/supabaseClient.js';

/**
 * Deterministic UUID generator using standard WebCrypto SHA-256
 * Produces standard 8-4-4-4-12 hex UUID strings matching seed.sql
 */
export async function stringToUuid(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Resolves Subject UUID for given branch and code
 */
export async function getSubjectUuid(branch, code) {
  return stringToUuid(`${branch}:${code}`);
}

/**
 * Resolves Timetable Slot UUID for given branch, scope, schedule slot, and code
 */
export async function getSlotUuid(branch, batchScope, dayOfWeek, startTime, endTime, code) {
  return stringToUuid(`${branch}:${batchScope}:${dayOfWeek}:${startTime}:${endTime}:${code}`);
}

/**
 * Fetches all attendance logs for a student from Supabase
 */
export async function fetchStudentLogs(studentId) {
  if (!studentId) return [];

  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Could not fetch attendance logs from Supabase:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Network or database error fetching attendance logs:', err.message);
    return [];
  }
}

/**
 * Returns today's calendar date string in YYYY-MM-DD format for Asia/Kolkata timezone.
 * Avoids toISOString().split('T')[0] which returns UTC date.
 */
export function getKolkataTodayDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Returns the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * from a YYYY-MM-DD date string without UTC timezone shifting.
 */
export function getDayOfWeekFromDateString(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 0;
  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.getDay();
}

/**
 * Upserts an attendance log record into Supabase specifying hour_index
 * - PRESENT / ABSENT / CANCELLED -> Upserts row in DB with hour_index
 * - UNMARKED -> No DB row created (removes row if previously marked)
 * Supports either slotId (recurring) OR extraLectureId (extra class).
 */
export async function saveAttendanceLog({
  studentId,
  subjectId,
  slotId = null,
  extraLectureId = null,
  date,
  status,
  hourIndex = 1,
}) {
  if (!studentId || !subjectId || (!slotId && !extraLectureId) || !date || !status) {
    throw new Error('Missing required parameters for saving attendance log');
  }

  const isExtra = Boolean(extraLectureId);

  try {
    // If status is UNMARKED, delete existing record from Supabase
    if (status === 'UNMARKED') {
      const targetHourIndex = Number(hourIndex || 1);

      let delQuery = supabase
        .from('attendance_logs')
        .delete()
        .eq('student_id', studentId)
        .eq('date', date)
        .eq('hour_index', targetHourIndex);

      if (isExtra) {
        delQuery = delQuery
          .eq('extra_lecture_id', extraLectureId)
          .is('slot_id', null);
      } else {
        delQuery = delQuery
          .eq('slot_id', slotId)
          .is('extra_lecture_id', null);
      }

      const { data: delData, error: delErr } = await delQuery.select();

      if (delErr) {
        console.warn('Could not delete unmarked log from Supabase:', delErr.message);
        return { success: false, error: delErr.message };
      }

      // Check if delete returned 0 rows
      if (!delData || delData.length === 0) {
        // Check if row still exists in DB to determine if deletion was blocked (e.g. by RLS)
        let checkQuery = supabase
          .from('attendance_logs')
          .select('id')
          .eq('student_id', studentId)
          .eq('date', date)
          .eq('hour_index', targetHourIndex);

        if (isExtra) {
          checkQuery = checkQuery.eq('extra_lecture_id', extraLectureId).is('slot_id', null);
        } else {
          checkQuery = checkQuery.eq('slot_id', slotId).is('extra_lecture_id', null);
        }

        const { data: checkData } = await checkQuery;
        if (checkData && checkData.length > 0) {
          const errMsg = 'Database deletion failed: row still exists in Supabase (check RLS DELETE policy)';
          console.warn(errMsg);
          return { success: false, error: errMsg };
        }
      }

      return { success: true, data: delData && delData.length > 0 ? delData[0] : null };
    }

    const payload = {
      student_id: studentId,
      subject_id: subjectId,
      slot_id: isExtra ? null : slotId,
      extra_lecture_id: isExtra ? extraLectureId : null,
      date: date,
      hour_index: hourIndex,
      status: status,
      marked_at: new Date().toISOString(),
    };

    const onConflictTarget = isExtra
      ? 'student_id,date,extra_lecture_id,hour_index'
      : 'student_id,date,slot_id,hour_index';

    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert(payload, { onConflict: onConflictTarget })
      .select();

    if (error) {
      console.warn('Supabase log upsert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data ? data[0] : null };
  } catch (err) {
    console.warn('Error saving attendance log:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to find marked log entry for a specific date, slot UUID, and hour index
 * Legacy logs without hour_index fall back to hour_index = 1
 */
export function getLogForSlotHour(logsList, date, slotUuid, hourIndex = 1) {
  if (!logsList || !slotUuid || !date) return null;
  const found = logsList.find((l) => {
    if (l.date !== date || l.slot_id !== slotUuid) return false;
    const logHour = Number(l.hour_index || 1);
    return logHour === Number(hourIndex);
  });
  return found && found.status !== 'UNMARKED' ? found : null;
}

/**
 * Helper to find marked log entry for an extra lecture, date, and hour index
 */
export function getLogForExtraLectureHour(logsList, date, extraLectureId, hourIndex = 1) {
  if (!logsList || !extraLectureId || !date) return null;
  const found = logsList.find((l) => {
    if (l.date !== date || l.extra_lecture_id !== extraLectureId) return false;
    const logHour = Number(l.hour_index || 1);
    return logHour === Number(hourIndex);
  });
  return found && found.status !== 'UNMARKED' ? found : null;
}

/**
 * Calculates overall and subject-wise attendance metrics including Phase 4 Bunk / Recovery
 * - Each log record represents 1 hourly unit
 * - Conducted = PRESENT + ABSENT (CANCELLED & UNMARKED classes excluded)
 * - Percentage = (PRESENT / Conducted) * 100
 * - Handles target percentage boundary cases (0%, 100%, null/invalid) safely
 */
export function calculateAttendanceMetrics(subjectsList, logsList) {
  const logsBySubject = {};
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalCancelled = 0;

  logsList.forEach(log => {
    if (!logsBySubject[log.subject_id]) {
      logsBySubject[log.subject_id] = { PRESENT: 0, ABSENT: 0, CANCELLED: 0 };
    }
    if (log.status === 'PRESENT') {
      logsBySubject[log.subject_id].PRESENT++;
      totalPresent++;
    } else if (log.status === 'ABSENT') {
      logsBySubject[log.subject_id].ABSENT++;
      totalAbsent++;
    } else if (log.status === 'CANCELLED') {
      logsBySubject[log.subject_id].CANCELLED++;
      totalCancelled++;
    }
  });

  const subjectMetrics = subjectsList.map(sub => {
    const counts = logsBySubject[sub.id] || { PRESENT: 0, ABSENT: 0, CANCELLED: 0 };
    const conducted = counts.PRESENT + counts.ABSENT;
    const percentage = conducted > 0 ? Math.round((counts.PRESENT / conducted) * 100) : 0;
    
    // Target percentage fallback to 75.0 if null, undefined, or invalid
    let rawTarget = sub.target_percentage !== undefined && sub.target_percentage !== null 
      ? Number(sub.target_percentage) 
      : 75;
    if (isNaN(rawTarget) || rawTarget < 0) rawTarget = 75;
    const targetPercentage = Math.min(Math.max(rawTarget, 0), 100);
    const targetDecimal = targetPercentage / 100;

    let safeBunks = 0;
    let recoveryNeeded = 0;
    let guidanceText = 'No classes conducted yet';
    let status = 'NEUTRAL';

    if (conducted > 0) {
      if (targetPercentage === 0) {
        status = 'SAFE';
        safeBunks = Infinity;
        guidanceText = 'Unlimited bunks available';
      } else if (targetPercentage === 100) {
        if (counts.ABSENT === 0) {
          status = 'SAFE';
          safeBunks = Infinity;
          guidanceText = 'Unlimited bunks available (100% required)';
        } else {
          status = 'AT_RISK';
          recoveryNeeded = counts.ABSENT;
          guidanceText = `Attend the next ${recoveryNeeded} consecutive class${recoveryNeeded === 1 ? '' : 'es'}`;
        }
      } else if (counts.PRESENT >= targetDecimal * conducted) {
        status = 'SAFE';
        safeBunks = Math.floor((counts.PRESENT - targetDecimal * conducted) / targetDecimal);
        if (safeBunks > 0) {
          guidanceText = `You can safely miss ${safeBunks} more class${safeBunks === 1 ? '' : 'es'}`;
        } else {
          guidanceText = 'On track (0 bunks available)';
        }
      } else {
        status = 'AT_RISK';
        recoveryNeeded = Math.ceil((targetDecimal * conducted - counts.PRESENT) / (1 - targetDecimal));
        guidanceText = `Attend the next ${recoveryNeeded} consecutive class${recoveryNeeded === 1 ? '' : 'es'}`;
      }
    }

    return {
      ...sub,
      presentCount: counts.PRESENT,
      absentCount: counts.ABSENT,
      cancelledCount: counts.CANCELLED,
      conductedCount: conducted,
      percentage: percentage,
      targetPercentage: targetPercentage,
      safeBunks: Number.isFinite(safeBunks) ? safeBunks : 999,
      recoveryNeeded: Number.isFinite(recoveryNeeded) ? recoveryNeeded : 0,
      guidanceText: guidanceText,
      status: status,
    };
  });

  const totalConducted = totalPresent + totalAbsent;
  const overallPercentage = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0;
  const overallTargetDecimal = 0.75; // Default overall 75.0%

  let overallSafeBunks = 0;
  let overallRecoveryNeeded = 0;
  let overallGuidanceText = 'No classes conducted yet';
  let overallStatus = 'NEUTRAL';

  if (totalConducted > 0) {
    if (totalPresent >= overallTargetDecimal * totalConducted) {
      overallStatus = 'SAFE';
      overallSafeBunks = Math.floor((totalPresent - overallTargetDecimal * totalConducted) / overallTargetDecimal);
      if (overallSafeBunks > 0) {
        overallGuidanceText = `You can safely miss ${overallSafeBunks} more class${overallSafeBunks === 1 ? '' : 'es'}`;
      } else {
        overallGuidanceText = 'On track (0 bunks available)';
      }
    } else {
      overallStatus = 'AT_RISK';
      overallRecoveryNeeded = Math.ceil((overallTargetDecimal * totalConducted - totalPresent) / (1 - overallTargetDecimal));
      overallGuidanceText = `Attend the next ${overallRecoveryNeeded} consecutive class${overallRecoveryNeeded === 1 ? '' : 'es'}`;
    }
  }

  return {
    overall: {
      totalConducted,
      totalPresent,
      totalAbsent,
      totalCancelled,
      overallPercentage,
      safeBunks: overallSafeBunks,
      recoveryNeeded: overallRecoveryNeeded,
      guidanceText: overallGuidanceText,
      status: overallStatus,
    },
    subjectMetrics,
  };
}
