import { supabase } from '../lib/supabaseClient';

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
 * Upserts an attendance log record into Supabase using relational foreign keys
 */
export async function saveAttendanceLog({ studentId, subjectId, slotId, date, status }) {
  if (!studentId || !subjectId || !slotId || !date || !status) {
    throw new Error('Missing required parameters for saving attendance log');
  }

  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert(
        {
          student_id: studentId,
          subject_id: subjectId,
          slot_id: slotId,
          date: date,
          status: status,
          marked_at: new Date().toISOString(),
        },
        {
          onConflict: 'student_id,date,slot_id,subject_id',
        }
      )
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
 * Calculates overall and subject-wise attendance metrics
 * - Conducted = PRESENT + ABSENT (CANCELLED classes excluded)
 * - Percentage = (PRESENT / Conducted) * 100
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
    const target = sub.target_percentage || sub.targetPercentage || 75;

    return {
      ...sub,
      presentCount: counts.PRESENT,
      absentCount: counts.ABSENT,
      cancelledCount: counts.CANCELLED,
      conductedCount: conducted,
      percentage: percentage,
      status: conducted === 0 ? 'NEUTRAL' : percentage >= target ? 'SAFE' : 'AT_RISK',
    };
  });

  const totalConducted = totalPresent + totalAbsent;
  const overallPercentage = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0;

  return {
    overall: {
      totalConducted,
      totalPresent,
      totalAbsent,
      totalCancelled,
      overallPercentage,
    },
    subjectMetrics,
  };
}
