import { supabase } from '../lib/supabaseClient.js';
import { triggerAttendanceAlertCheck } from './attendanceService.js';

/**
 * Dynamically loads eligible curriculum subjects for a student directly from Supabase public.subjects table.
 * Single source of truth: filters by subject.branch = student.branch AND (subject.batch = 'ALL' OR subject.batch = student.batch).
 */
export async function fetchEligibleSubjects(branch, batch) {
  if (!branch) return [];

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch', branch)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching subjects from Supabase public.subjects table:', error.message);
      return [];
    }

    return (data || []).filter(
      (sub) => sub.branch === branch && (sub.batch === 'ALL' || sub.batch === batch)
    );
  } catch (err) {
    console.warn('Network error fetching subjects from Supabase:', err.message);
    return [];
  }
}

/**
 * Validates extra lecture duration.
 * Must be positive and an exact whole number of hours (e.g., 60m=1h, 120m=2h, 180m=3h).
 * Rejects non-whole hours (e.g. 90m, 30m) without silent rounding.
 */
export function validateExtraLectureDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return { isValid: false, durationHours: 0, error: 'Start time and end time are required' };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);
  const deltaMinutes = endMinutes - startMinutes;

  if (deltaMinutes <= 0) {
    return { isValid: false, durationHours: 0, error: 'End time must be strictly after start time' };
  }

  if (deltaMinutes % 60 !== 0) {
    return {
      isValid: false,
      durationHours: 0,
      error: 'Extra lectures must be whole hour durations (e.g., 1h, 2h, 3h)',
    };
  }

  const durationHours = deltaMinutes / 60;
  return { isValid: true, durationHours, error: null };
}

/**
 * Expands an extra lecture into integer hourly sub-slots
 */
export function expandExtraLectureToHourlyUnits(extraLecture) {
  const { startTime, endTime, start_time, end_time } = extraLecture;
  const sTime = startTime || start_time;
  const eTime = endTime || end_time;

  const [startH, startM] = sTime.split(':').map(Number);
  const validation = validateExtraLectureDuration(sTime, eTime);
  const duration = validation.isValid ? validation.durationHours : 1;

  const hours = [];
  for (let h = 0; h < duration; h++) {
    const hStart = String(startH + h).padStart(2, '0') + ':' + String(startM || 0).padStart(2, '0');
    const hEnd = String(startH + h + 1).padStart(2, '0') + ':' + String(startM || 0).padStart(2, '0');
    hours.push({
      hourIndex: h + 1,
      startTime: hStart,
      endTime: hEnd,
      label: duration > 1 ? `Hour ${h + 1} (${hStart} - ${hEnd})` : `${hStart} - ${hEnd}`,
    });
  }

  return hours;
}

/**
 * Fetches all extra lectures for a given student from Supabase
 */
export async function fetchExtraLecturesForStudent(studentId) {
  if (!studentId) return [];

  try {
    const { data, error } = await supabase
      .from('extra_lectures')
      .select('*, subjects(code, name, type, teacher, branch, batch)')
      .eq('student_id', studentId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.warn('Could not fetch extra lectures from Supabase:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Network error fetching extra lectures:', err.message);
    return [];
  }
}

/**
 * Inserts a new extra lecture into Supabase
 */
export async function createExtraLecture({ studentId, subjectId, date, startTime, endTime }) {
  const validation = validateExtraLectureDuration(startTime, endTime);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  try {
    const { data, error } = await supabase
      .from('extra_lectures')
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        date: date,
        start_time: startTime,
        end_time: endTime,
      })
      .select('*, subjects(code, name, type, teacher, branch, batch)');

    if (error) {
      console.warn('Supabase create extra lecture error:', error.message);
      return { success: false, error: error.message };
    }

    if (subjectId) {
      triggerAttendanceAlertCheck(subjectId);
    }

    return { success: true, data: data ? data[0] : null };
  } catch (err) {
    console.warn('Error creating extra lecture:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing extra lecture in Supabase
 */
export async function updateExtraLecture({ id, studentId, subjectId, date, startTime, endTime }) {
  const validation = validateExtraLectureDuration(startTime, endTime);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  try {
    const { data, error } = await supabase
      .from('extra_lectures')
      .update({
        subject_id: subjectId,
        date: date,
        start_time: startTime,
        end_time: endTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('student_id', studentId)
      .select('*, subjects(code, name, type, teacher, branch, batch)');

    if (error) {
      console.warn('Supabase update extra lecture error:', error.message);
      return { success: false, error: error.message };
    }

    if (subjectId) {
      triggerAttendanceAlertCheck(subjectId);
    }

    return { success: true, data: data ? data[0] : null };
  } catch (err) {
    console.warn('Error updating extra lecture:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an extra lecture from Supabase.
 * Cascade deletion in DB automatically removes associated attendance logs.
 */
export async function deleteExtraLecture(id, studentId, subjectId = null) {
  if (!id || !studentId) {
    return { success: false, error: 'Missing id or studentId' };
  }

  try {
    const { error } = await supabase
      .from('extra_lectures')
      .delete()
      .eq('id', id)
      .eq('student_id', studentId);

    if (error) {
      console.warn('Supabase delete extra lecture error:', error.message);
      return { success: false, error: error.message };
    }

    if (subjectId) {
      triggerAttendanceAlertCheck(subjectId);
    }

    return { success: true };
  } catch (err) {
    console.warn('Error deleting extra lecture:', err.message);
    return { success: false, error: err.message };
  }
}
