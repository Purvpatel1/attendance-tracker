import { supabase } from '../lib/supabaseClient.js';

/**
 * Pure JavaScript SHA-256 implementation fallback for non-secure HTTP contexts
 * (e.g. accessing Vite network IP URL from mobile devices where crypto.subtle is undefined).
 */
function sha256Pure(str) {
  function safe_add(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function S(X, n) { return (X >>> n) | (X << (32 - n)); }
  function R(X, n) { return (X >>> n); }
  function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
  function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
  function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
  function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
  function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
  function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const blocks = [];
  for (let i = 0; i < bytes.length; i++) {
    blocks[i >> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8);
  }
  blocks[bytes.length >> 2] |= 0x80 << (24 - (bytes.length % 4) * 8);
  blocks[(((bytes.length + 8) >> 6) << 4) + 15] = bytes.length * 8;

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  const W = new Array(64);
  for (let i = 0; i < blocks.length; i += 16) {
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let j = 0; j < 64; j++) {
      if (j < 16) W[j] = blocks[i + j] || 0;
      else {
        W[j] = safe_add(
          safe_add(Gamma1256(W[j - 2]), W[j - 7]),
          safe_add(Gamma0256(W[j - 15]), W[j - 16])
        );
      }

      const T1 = safe_add(safe_add(safe_add(h, Sigma1256(e)), safe_add(Ch(e, f, g), K[j])), W[j]);
      const T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = safe_add(d, T1);
      d = c;
      c = b;
      b = a;
      a = safe_add(T1, T2);
    }

    H0 = safe_add(a, H0);
    H1 = safe_add(b, H1);
    H2 = safe_add(c, H2);
    H3 = safe_add(d, H3);
    H4 = safe_add(e, H4);
    H5 = safe_add(f, H5);
    H6 = safe_add(g, H6);
    H7 = safe_add(h, H7);
  }

  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return (toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) + toHex(H4) + toHex(H5) + toHex(H6) + toHex(H7));
}

/**
 * Deterministic UUID generator using WebCrypto SHA-256 with pure JS fallback.
 * Produces standard 8-4-4-4-12 hex UUID strings matching seed.sql across all environments.
 */
export async function stringToUuid(str) {
  let hash;
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    globalThis.crypto.subtle &&
    typeof globalThis.crypto.subtle.digest === 'function'
  ) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    hash = sha256Pure(str);
  }
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
  id = null,
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
        .eq('student_id', studentId);

      if (id) {
        delQuery = delQuery.eq('id', id);
      } else {
        delQuery = delQuery.eq('date', date).eq('hour_index', targetHourIndex);
        if (isExtra) {
          delQuery = delQuery.eq('extra_lecture_id', extraLectureId).is('slot_id', null);
        } else {
          delQuery = delQuery.eq('slot_id', slotId).is('extra_lecture_id', null);
        }
      }

      const { data: delData, error: delErr } = await delQuery.select();

      if (delErr) {
        console.warn('Could not delete unmarked log from Supabase:', delErr.message);
        return { success: false, error: delErr.message };
      }

      // Check if delete returned 0 rows (when no ID was passed or check RLS)
      if (!delData || delData.length === 0) {
        let checkQuery = supabase
          .from('attendance_logs')
          .select('id')
          .eq('student_id', studentId);

        if (id) {
          checkQuery = checkQuery.eq('id', id);
        } else {
          checkQuery = checkQuery.eq('date', date).eq('hour_index', targetHourIndex);
          if (isExtra) {
            checkQuery = checkQuery.eq('extra_lecture_id', extraLectureId).is('slot_id', null);
          } else {
            checkQuery = checkQuery.eq('slot_id', slotId).is('extra_lecture_id', null);
          }
        }

        const { data: checkData } = await checkQuery;
        if (checkData && checkData.length > 0) {
          const errMsg = 'Database deletion failed: row still exists in Supabase (check RLS DELETE policy)';
          console.warn(errMsg);
          return { success: false, error: errMsg };
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance-updated'));
      }

      return { success: true, data: delData && delData.length > 0 ? delData[0] : null };
    }

    // If existing record ID is provided, perform an explicit UPDATE, NEVER an INSERT
    if (id) {
      const { data: updateData, error: updateErr } = await supabase
        .from('attendance_logs')
        .update({
          status: status,
          marked_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('student_id', studentId)
        .select();

      if (updateErr) {
        console.warn('Supabase log update warning:', updateErr.message);
        return { success: false, error: updateErr.message };
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance-updated'));
      }

      return { success: true, data: updateData ? updateData[0] : null };
    }

    // Otherwise, perform upsert for new records
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('attendance-updated'));
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
