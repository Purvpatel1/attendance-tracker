import { calculateAttendanceMetrics, getLogForSlotHour } from '../src/services/attendanceService.js';

console.log('========================================================');
console.log('RUNNING TRUE HOUR-BY-HOUR ATTENDANCE TEST SUITE');
console.log('========================================================\n');

const mockSubjects = [
  { id: 'sub-1', code: 'SUB1', name: 'Subject 1', target_percentage: 75.0 },
  { id: 'sub-target-100', code: 'SUB100', name: 'Subject 100%', target_percentage: 100.0 },
  { id: 'sub-target-0', code: 'SUB0', name: 'Subject 0%', target_percentage: 0.0 },
];

function runHourTest(testName, subjectId, logs, expected) {
  const selectedSub = mockSubjects.find(s => s.id === subjectId) || mockSubjects[0];
  const result = calculateAttendanceMetrics([selectedSub], logs);
  const subRes = result.subjectMetrics[0];

  const presentMatch = subRes.presentCount === expected.present;
  const absentMatch = subRes.absentCount === expected.absent;
  const conductedMatch = subRes.conductedCount === expected.conducted;
  const pctMatch = subRes.percentage === expected.percentage;

  const passed = presentMatch && absentMatch && conductedMatch && pctMatch;

  console.log(`TEST: ${testName}`);
  console.log(`  Logs Count    : ${logs.length} logged hour records`);
  console.log(`  Expected      : P=${expected.present}, A=${expected.absent}, C=${expected.conducted}, %=${expected.percentage}%`);
  console.log(`  Actual        : P=${subRes.presentCount}, A=${subRes.absentCount}, C=${subRes.conductedCount}, %=${subRes.percentage}%`);
  console.log(`  Guidance Text : "${subRes.guidanceText}"`);
  console.log(`  Result        : ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
}

// Test 1: 1-Hour Present
runHourTest('1. 1-Hour Present', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
], { present: 1, absent: 0, conducted: 1, percentage: 100 });

// Test 2: 1-Hour Absent
runHourTest('2. 1-Hour Absent', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'ABSENT' },
], { present: 0, absent: 1, conducted: 1, percentage: 0 });

// Test 3: 2-Hour Present + Present
runHourTest('3. 2-Hour Present + Present', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 2, status: 'PRESENT' },
], { present: 2, absent: 0, conducted: 2, percentage: 100 });

// Test 4: 2-Hour Present + Unmarked (Hour 2 has NO log row)
runHourTest('4. 2-Hour Present + Unmarked (Hr 2 has no DB row)', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  // Hour 2 UNMARKED -> no row in DB
], { present: 1, absent: 0, conducted: 1, percentage: 100 });

// Test 5: 2-Hour Present + Absent
runHourTest('5. 2-Hour Present + Absent', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 2, status: 'ABSENT' },
], { present: 1, absent: 1, conducted: 2, percentage: 50 });

// Test 6: 2-Hour Absent + Present
runHourTest('6. 2-Hour Absent + Present', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'ABSENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 2, status: 'PRESENT' },
], { present: 1, absent: 1, conducted: 2, percentage: 50 });

// Test 7: 2-Hour Absent + Absent
runHourTest('7. 2-Hour Absent + Absent', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'ABSENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 2, status: 'ABSENT' },
], { present: 0, absent: 2, conducted: 2, percentage: 0 });

// Test 8: Cancelled Hour Excluded
runHourTest('8. Cancelled Hour Excluded', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'CANCELLED' },
], { present: 0, absent: 0, conducted: 0, percentage: 0 });

// Test 9: 4-Hour Mixed Session (Hr 1: P, Hr 2: P, Hr 3: A, Hr 4: C)
runHourTest('9. 4-Hour Mixed Session (P, P, A, C)', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 2, status: 'PRESENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 3, status: 'ABSENT' },
  { subject_id: 'sub-1', slot_id: 'slot-1', hour_index: 4, status: 'CANCELLED' },
], { present: 2, absent: 1, conducted: 3, percentage: 67 });

// Test 10: 100% Target with 0 Absences
runHourTest('10. 100% Target w/ 0 Absences', 'sub-target-100', [
  { subject_id: 'sub-target-100', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-target-100', slot_id: 'slot-1', hour_index: 2, status: 'PRESENT' },
], { present: 2, absent: 0, conducted: 2, percentage: 100 });

// Test 11: 100% Target with 1 Absence
runHourTest('11. 100% Target w/ 1 Absence', 'sub-target-100', [
  { subject_id: 'sub-target-100', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-target-100', slot_id: 'slot-1', hour_index: 2, status: 'ABSENT' },
], { present: 1, absent: 1, conducted: 2, percentage: 50 });

// Test 12: 0% Target Boundary
runHourTest('12. 0% Target Boundary', 'sub-target-0', [
  { subject_id: 'sub-target-0', slot_id: 'slot-1', hour_index: 1, status: 'PRESENT' },
  { subject_id: 'sub-target-0', slot_id: 'slot-1', hour_index: 2, status: 'ABSENT' },
], { present: 1, absent: 1, conducted: 2, percentage: 50 });

// Test 13: Existing Phase 3 Log (Missing hour_index defaults to 1)
runHourTest('13. Legacy Phase 3 Log (No hour_index)', 'sub-1', [
  { subject_id: 'sub-1', slot_id: 'slot-1', status: 'PRESENT' }, // legacy row
], { present: 1, absent: 0, conducted: 1, percentage: 100 });
