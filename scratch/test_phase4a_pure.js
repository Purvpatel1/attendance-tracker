// Pure mathematical verification of Phase 4A Bunk & Recovery calculations
function calculateAttendanceMetrics(subjectsList, logsList) {
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
    const targetPercentage = Number(sub.target_percentage || sub.targetPercentage || 75);
    const targetDecimal = targetPercentage / 100;

    let safeBunks = 0;
    let recoveryNeeded = 0;
    let guidanceText = 'No classes conducted yet';
    let status = 'NEUTRAL';

    if (conducted > 0) {
      if (counts.PRESENT >= targetDecimal * conducted) {
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
      safeBunks: safeBunks,
      recoveryNeeded: recoveryNeeded,
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
