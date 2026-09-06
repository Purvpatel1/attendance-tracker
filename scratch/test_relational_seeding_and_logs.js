import { SUBJECTS_BY_BRANCH, TIMETABLE_SLOTS_BY_BRANCH } from '../src/data/timetableData.js';

export async function stringToUuid(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function resolveSubjectAndSlotIds(branch, batchScope, dayOfWeek, startTime, endTime, code, index) {
  const subjectId = await stringToUuid(`${branch}:${code}`);
  const slotId = await stringToUuid(`${branch}:${batchScope}:${dayOfWeek}:${startTime}:${endTime}:${code}:${index}`);
  return { subjectId, slotId };
}

export function calculateMetrics(subjects, logs) {
  // Map logs by subjectId
  const logsBySubject = {};
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalCancelled = 0;

  logs.forEach(log => {
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

  const subjectMetrics = subjects.map(sub => {
    const counts = logsBySubject[sub.id] || { PRESENT: 0, ABSENT: 0, CANCELLED: 0 };
    const conducted = counts.PRESENT + counts.ABSENT;
    const percentage = conducted > 0 ? Math.round((counts.PRESENT / conducted) * 100) : 0;
    return {
      ...sub,
      present: counts.PRESENT,
      absent: counts.ABSENT,
      cancelled: counts.CANCELLED,
      conducted: conducted,
      percentage: percentage,
      status: percentage >= (sub.targetPercentage || 75) ? 'SAFE' : 'AT_RISK',
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
