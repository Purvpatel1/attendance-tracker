import { validateExtraLectureDuration, expandExtraLectureToHourlyUnits } from '../src/services/extraLectureService.js';
import { calculateAttendanceMetrics, getLogForExtraLectureHour } from '../src/services/attendanceService.js';

console.log('========================================================');
console.log('RUNNING PHASE 4B EXTRA LECTURES TEST SUITE');
console.log('========================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(description, condition, details = '') {
  totalCount++;
  if (condition) {
    passCount++;
    console.log(`✅ [PASS] Test ${totalCount}: ${description} ${details ? `(${details})` : ''}`);
  } else {
    console.log(`❌ [FAIL] Test ${totalCount}: ${description} ${details ? `(${details})` : ''}`);
  }
}

// 1. Add 1-hour extra lecture duration validation
const test1 = validateExtraLectureDuration('14:00', '15:00');
assert('1-hour Extra Lecture Duration (14:00-15:00)', test1.isValid && test1.durationHours === 1, `Duration: ${test1.durationHours}h`);

// 2. Add 2-hour extra lecture duration validation
const test2 = validateExtraLectureDuration('14:00', '16:00');
assert('2-hour Extra Lecture Duration (14:00-16:00)', test2.isValid && test2.durationHours === 2, `Duration: ${test2.durationHours}h`);

// 3. Add 4-hour extra lecture duration validation
const test3 = validateExtraLectureDuration('08:00', '12:00');
assert('4-hour Extra Lecture Duration (08:00-12:00)', test3.isValid && test3.durationHours === 4, `Duration: ${test3.durationHours}h`);

// Non-integer duration rejection test (e.g. 90m)
const testNonInteger = validateExtraLectureDuration('14:00', '15:30');
assert('Non-whole hour duration (90 mins) rejection', !testNonInteger.isValid, `Error: "${testNonInteger.error}"`);

// 4. Mark only Hour 1 PRESENT
const mockSubject = { id: 'sub-dbms', code: '26AF1245PC504', name: 'Database Management System', target_percentage: 75 };
const logsHour1Present = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'PRESENT' }
];
const resHour1 = calculateAttendanceMetrics([mockSubject], logsHour1Present);
const subHour1 = resHour1.subjectMetrics[0];
assert('Mark Hour 1 PRESENT only', subHour1.conductedCount === 1 && subHour1.presentCount === 1 && subHour1.percentage === 100);

// 5. Mark Hour 1 PRESENT + Hour 2 ABSENT
const logsMixed = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 2, status: 'ABSENT' }
];
const resMixed = calculateAttendanceMetrics([mockSubject], logsMixed);
const subMixed = resMixed.subjectMetrics[0];
assert('Hour 1 PRESENT + Hour 2 ABSENT', subMixed.conductedCount === 2 && subMixed.presentCount === 1 && subMixed.absentCount === 1 && subMixed.percentage === 50);

// 6. Mark Hour 1 ABSENT + Hour 2 PRESENT
const logsMixedRev = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'ABSENT' },
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 2, status: 'PRESENT' }
];
const resMixedRev = calculateAttendanceMetrics([mockSubject], logsMixedRev);
const subMixedRev = resMixedRev.subjectMetrics[0];
assert('Hour 1 ABSENT + Hour 2 PRESENT', subMixedRev.conductedCount === 2 && subMixedRev.presentCount === 1 && subMixedRev.absentCount === 1 && subMixedRev.percentage === 50);

// 7. Mark all hours PRESENT (2-hour)
const logsAllPresent = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 2, status: 'PRESENT' }
];
const resAllPresent = calculateAttendanceMetrics([mockSubject], logsAllPresent);
const subAllPresent = resAllPresent.subjectMetrics[0];
assert('Mark all hours PRESENT (2h)', subAllPresent.conductedCount === 2 && subAllPresent.presentCount === 2 && subAllPresent.percentage === 100);

// 8. Mark all hours ABSENT (2-hour)
const logsAllAbsent = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'ABSENT' },
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 2, status: 'ABSENT' }
];
const resAllAbsent = calculateAttendanceMetrics([mockSubject], logsAllAbsent);
const subAllAbsent = resAllAbsent.subjectMetrics[0];
assert('Mark all hours ABSENT (2h)', subAllAbsent.conductedCount === 2 && subAllAbsent.absentCount === 2 && subAllAbsent.percentage === 0);

// 9. Leave an hour UNMARKED (Hour 2 has no log row in DB)
const logsUnmarked = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'PRESENT' }
];
const hr2Log = getLogForExtraLectureHour(logsUnmarked, '2026-09-07', 'extra-1', 2);
assert('Leave Hour 2 UNMARKED (no DB row)', hr2Log === undefined || hr2Log === null, 'Lookup returned null/undefined');

// 10. Cancel an hour
const logsCancelled = [
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'CANCELLED' },
  { subject_id: 'sub-dbms', extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 2, status: 'PRESENT' }
];
const resCancelled = calculateAttendanceMetrics([mockSubject], logsCancelled);
const subCancelled = resCancelled.subjectMetrics[0];
assert('Cancelled hour excluded from conducted', subCancelled.conductedCount === 1 && subCancelled.presentCount === 1 && subCancelled.cancelledCount === 1 && subCancelled.percentage === 100);

// 11. Coexistence of Recurring slot and Extra Lecture on same subject/date
const logsCoexist = [
  { subject_id: 'sub-dbms', slot_id: 'slot-recurring-1', extra_lecture_id: null, date: '2026-09-07', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-dbms', slot_id: null, extra_lecture_id: 'extra-1', date: '2026-09-07', hour_index: 1, status: 'ABSENT' }
];
const resCoexist = calculateAttendanceMetrics([mockSubject], logsCoexist);
const subCoexist = resCoexist.subjectMetrics[0];
assert('Recurring Slot + Extra Lecture Coexistence', subCoexist.conductedCount === 2 && subCoexist.presentCount === 1 && subCoexist.absentCount === 1 && subCoexist.percentage === 50);

// 12. Phase 4A Safe Bunks Calculation with Extra Class (10 Conducted, 8 Present, 75% Target)
const logsBunks = [
  ...Array(8).fill(null).map((_, i) => ({ subject_id: 'sub-dbms', extra_lecture_id: `ex-${i}`, date: '2026-09-07', hour_index: 1, status: 'PRESENT' })),
  ...Array(2).fill(null).map((_, i) => ({ subject_id: 'sub-dbms', extra_lecture_id: `ex-abs-${i}`, date: '2026-09-07', hour_index: 1, status: 'ABSENT' })),
];
const resBunks = calculateAttendanceMetrics([mockSubject], logsBunks);
const subBunks = resBunks.subjectMetrics[0];
assert('Phase 4A Bunk Guidance with Extra Classes', subBunks.conductedCount === 10 && subBunks.presentCount === 8 && subBunks.safeBunks === 0, `Guidance: "${subBunks.guidanceText}"`);

// 13. Phase 4A Recovery Calculation (10 Conducted, 6 Present, 75% Target)
const logsRecovery = [
  ...Array(6).fill(null).map((_, i) => ({ subject_id: 'sub-dbms', extra_lecture_id: `ex-${i}`, date: '2026-09-07', hour_index: 1, status: 'PRESENT' })),
  ...Array(4).fill(null).map((_, i) => ({ subject_id: 'sub-dbms', extra_lecture_id: `ex-abs-${i}`, date: '2026-09-07', hour_index: 1, status: 'ABSENT' })),
];
const resRecovery = calculateAttendanceMetrics([mockSubject], logsRecovery);
const subRecovery = resRecovery.subjectMetrics[0];
assert('Phase 4A Recovery Guidance with Extra Classes', subRecovery.conductedCount === 10 && subRecovery.presentCount === 6 && subRecovery.recoveryNeeded === 6, `Guidance: "${subRecovery.guidanceText}"`);

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passCount} / ${totalCount} PASSED`);
console.log('========================================================\n');
