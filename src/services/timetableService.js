import {
  SUBJECTS_BY_BRANCH,
  TIMETABLE_SLOTS_BY_BRANCH,
  BRANCH_BATCH_MAP,
} from '../data/timetableData.js';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

export { DAYS_OF_WEEK };

/**
 * Returns all subject metadata for a given branch
 */
export const getSubjectsForBranch = (branch) => {
  return SUBJECTS_BY_BRANCH[branch] || [];
};

/**
 * Returns the exact filtered timetable for a student's Branch and Batch.
 * Combines branch-wide sessions (batchScope === 'ALL') with batch-specific labs.
 */
export const getTimetableForStudent = (branch, batch) => {
  const allBranchSlots = TIMETABLE_SLOTS_BY_BRANCH[branch] || [];
  const subjectsMap = new Map();
  (SUBJECTS_BY_BRANCH[branch] || []).forEach((sub) => {
    subjectsMap.set(sub.code, sub);
  });

  // Filter slots for branch-wide or batch-specific
  const filteredSlots = allBranchSlots.filter((slot) => {
    return slot.batchScope === 'ALL' || slot.batchScope === batch;
  });

  // Enrich slots with subject details and expand hourly sub-units
  const enrichedSlots = filteredSlots.map((slot, index) => {
    const subject = subjectsMap.get(slot.code) || {
      name: slot.code,
      shortName: slot.code,
      type: 'Lecture',
      teacher: 'Faculty',
    };

    // Calculate duration in minutes
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const deltaMinutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));

    // Strict validation: must be > 0 and exact multiple of 60 minutes
    const isValidWholeHour = deltaMinutes > 0 && deltaMinutes % 60 === 0;
    const duration = isValidWholeHour ? deltaMinutes / 60 : 1;

    // Generate hourly sub-units array
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

    return {
      id: `${branch}_${batch}_d${slot.dayOfWeek}_${slot.startTime}_${index}`,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      code: slot.code,
      subjectName: subject.name,
      shortName: subject.shortName,
      type: subject.type,
      teacher: subject.teacher,
      room: slot.room,
      isBatchSpecific: slot.batchScope !== 'ALL',
      batchScope: slot.batchScope,
      duration: duration,
      hours: hours,
      isInvalidDuration: !isValidWholeHour,
    };
  });

  // Group by day of week
  const scheduleByDay = {};
  DAYS_OF_WEEK.forEach((day) => {
    const daySlots = enrichedSlots
      .filter((s) => s.dayOfWeek === day.id)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    scheduleByDay[day.id] = daySlots;
  });

  return {
    branch,
    batch,
    subjects: SUBJECTS_BY_BRANCH[branch] || [],
    totalSlotsCount: enrichedSlots.length,
    commonLecturesCount: enrichedSlots.filter((s) => !s.isBatchSpecific).length,
    batchLabsCount: enrichedSlots.filter((s) => s.isBatchSpecific).length,
    scheduleByDay,
  };
};

/**
 * Returns all 8 valid combinations of (Branch, Batch)
 */
export const getValidBranchBatchCombinations = () => {
  const combinations = [];
  Object.keys(BRANCH_BATCH_MAP).forEach((branch) => {
    BRANCH_BATCH_MAP[branch].forEach((batch) => {
      combinations.push({ branch, batch, key: `${branch} | ${batch}` });
    });
  });
  return combinations;
};
