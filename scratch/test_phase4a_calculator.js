import { calculateAttendanceMetrics } from '../src/services/attendanceService.js';

console.log('========================================================');
console.log('RUNNING PHASE 4A MATHEMATICAL VERIFICATION TEST SUITE');
console.log('========================================================\n');

const mockSubjects = [
  { id: 'sub-1', code: 'SUB1', name: 'Subject 1', target_percentage: 75.0 },
];

function runTest(testName, logs, expected) {
  const result = calculateAttendanceMetrics(mockSubjects, logs);
  const subRes = result.subjectMetrics[0];

  const safeMatch = subRes.safeBunks === expected.safeBunks;
  const recoveryMatch = subRes.recoveryNeeded === expected.recoveryNeeded;
  const statusMatch = subRes.status === expected.status;
  const percentageMatch = subRes.percentage === expected.percentage;
  const passed = safeMatch && recoveryMatch && statusMatch && percentageMatch;

  console.log(`TEST: ${testName}`);
  console.log(`  Input Logs    : ${JSON.stringify(logs.map(l => l.status))}`);
  console.log(`  Expected      : %=${expected.percentage}%, Bunks=${expected.safeBunks}, Recovery=${expected.recoveryNeeded}, Status=${expected.status}`);
  console.log(`  Actual        : %=${subRes.percentage}%, Bunks=${subRes.safeBunks}, Recovery=${subRes.recoveryNeeded}, Status=${subRes.status}`);
  console.log(`  Guidance Text : "${subRes.guidanceText}"`);
  console.log(`  Result        : ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
}

// Test Case 1: 100% Attendance (P=10, C=10, Target=75%)
runTest('100% Attendance (P=10, C=10)', [
  ...Array(10).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
], {
  percentage: 100,
  safeBunks: 3,
  recoveryNeeded: 0,
  status: 'SAFE',
});

// Test Case 2: Above Target 80% (P=20, A=5, C=25, Target=75%)
runTest('Above Target 80% (P=20, C=25)', [
  ...Array(20).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
  ...Array(5).fill({ subject_id: 'sub-1', status: 'ABSENT' }),
], {
  percentage: 80,
  safeBunks: 1,
  recoveryNeeded: 0,
  status: 'SAFE',
});

// Test Case 3: Exact Target 75% (P=15, A=5, C=20, Target=75%)
runTest('Exact Target 75% (P=15, C=20)', [
  ...Array(15).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
  ...Array(5).fill({ subject_id: 'sub-1', status: 'ABSENT' }),
], {
  percentage: 75,
  safeBunks: 0,
  recoveryNeeded: 0,
  status: 'SAFE',
});

// Test Case 4: Below Target 70% (P=14, A=6, C=20, Target=75%)
runTest('Below Target 70% (P=14, C=20)', [
  ...Array(14).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
  ...Array(6).fill({ subject_id: 'sub-1', status: 'ABSENT' }),
], {
  percentage: 70,
  safeBunks: 0,
  recoveryNeeded: 4,
  status: 'AT_RISK',
});

// Test Case 5: Below Target 60% (P=6, A=4, C=10, Target=75%)
runTest('Below Target 60% (P=6, C=10)', [
  ...Array(6).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
  ...Array(4).fill({ subject_id: 'sub-1', status: 'ABSENT' }),
], {
  percentage: 60,
  safeBunks: 0,
  recoveryNeeded: 6,
  status: 'AT_RISK',
});

// Test Case 6: Cancelled Classes Excluded (P=10, A=2, Cancelled=5, C=12, Target=75%)
runTest('Cancelled Classes Excluded (P=10, A=2, Cancelled=5, C=12)', [
  ...Array(10).fill({ subject_id: 'sub-1', status: 'PRESENT' }),
  ...Array(2).fill({ subject_id: 'sub-1', status: 'ABSENT' }),
  ...Array(5).fill({ subject_id: 'sub-1', status: 'CANCELLED' }),
], {
  percentage: 83,
  safeBunks: 1,
  recoveryNeeded: 0,
  status: 'SAFE',
});

// Test Case 7: 0 Conducted Classes
runTest('0 Conducted Classes (C=0)', [], {
  percentage: 0,
  safeBunks: 0,
  recoveryNeeded: 0,
  status: 'NEUTRAL',
});
