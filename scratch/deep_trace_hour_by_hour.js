import { supabase } from '../src/lib/supabaseClient.js';
import {
  fetchStudentLogs,
  saveAttendanceLog,
  getSubjectUuid,
  getSlotUuid,
  getLogForSlotHour,
  calculateAttendanceMetrics,
} from '../src/services/attendanceService.js';

async function runDeepTrace() {
  console.log('====================================================');
  console.log('STARTING DEEP HOUR-BY-HOUR RUNTIME TRACE');
  console.log('====================================================\n');

  // 1. Identify 2-hour slot
  const branch = 'Computer Science Engineering-AIML (AIML)';
  const batch = 'AM1';
  const slotCode = '26AIPCL509';
  const startTime = '11:00';
  const endTime = '13:00';
  const dayOfWeek = 1; // Monday

  console.log('1. TIMETABLE SLOT IDENTIFIED:');
  console.log('   Code        :', slotCode);
  console.log('   Name        : MLOps Laboratory');
  console.log('   Time        :', startTime, '-', endTime);
  console.log('   Duration    : 2 hours');
  console.log('   Expanded Hrs: Hour 1 (11:00-12:00), Hour 2 (12:00-13:00)');
  console.log('\n----------------------------------------------------\n');

  // 2. Resolve UUIDs
  const subjectUuid = await getSubjectUuid(branch, slotCode);
  const slotUuid = await getSlotUuid(
    branch,
    batch,
    dayOfWeek,
    startTime,
    endTime,
    slotCode
  );

  console.log('2. RESOLVED UUIDs:');
  console.log('   subject_id  :', subjectUuid);
  console.log('   slot_id     :', slotUuid);
  console.log('\n----------------------------------------------------\n');

  // 3. Test Student User
  const testStudentId = 'd3b07384-d113-4610-a292-628b030b65f7'; // Test student ID
  const testDate = '2026-09-07'; // A test Monday date

  console.log('3. CLEANING UP OLD TEST LOGS FOR DATE:', testDate);
  await supabase
    .from('attendance_logs')
    .delete()
    .eq('student_id', testStudentId)
    .eq('date', testDate);

  console.log('\n----------------------------------------------------\n');

  // 4. Mark Hour 1 PRESENT
  console.log('4. MARKING HOUR 1 = PRESENT...');
  const payload1 = {
    studentId: testStudentId,
    subjectId: subjectUuid,
    slotId: slotUuid,
    date: testDate,
    hourIndex: 1,
    status: 'PRESENT',
  };
  console.log('   Payload Sent:', JSON.stringify(payload1));
  const res1 = await saveAttendanceLog(payload1);
  console.log('   Save Result :', JSON.stringify(res1));

  console.log('\n----------------------------------------------------\n');

  // 5. Mark Hour 2 ABSENT
  console.log('5. MARKING HOUR 2 = ABSENT...');
  const payload2 = {
    studentId: testStudentId,
    subjectId: subjectUuid,
    slotId: slotUuid,
    date: testDate,
    hourIndex: 2,
    status: 'ABSENT',
  };
  console.log('   Payload Sent:', JSON.stringify(payload2));
  const res2 = await saveAttendanceLog(payload2);
  console.log('   Save Result :', JSON.stringify(res2));

  console.log('\n----------------------------------------------------\n');

  // 6. Fetch from Supabase
  console.log('6. FETCHING LOGS DIRECTLY FROM SUPABASE...');
  const fetchedLogs = await fetchStudentLogs(testStudentId);
  const testDateLogs = fetchedLogs.filter(l => l.date === testDate);
  console.log('   Rows Returned Count:', testDateLogs.length);
  testDateLogs.forEach((l, i) => {
    console.log(`   Row ${i + 1}: id=${l.id}, hour_index=${l.hour_index}, status=${l.status}, slot_id=${l.slot_id}`);
  });

  console.log('\n----------------------------------------------------\n');

  // 7. Lookup for Schedule View UI
  console.log('7. TESTING getLogForSlotHour LOGIC:');
  const hr1Log = getLogForSlotHour(fetchedLogs, testDate, slotUuid, 1);
  const hr2Log = getLogForSlotHour(fetchedLogs, testDate, slotUuid, 2);
  console.log('   Hour 1 Lookup Result:', hr1Log ? `${hr1Log.status} (hour_index: ${hr1Log.hour_index})` : 'NULL');
  console.log('   Hour 2 Lookup Result:', hr2Log ? `${hr2Log.status} (hour_index: ${hr2Log.hour_index})` : 'NULL');

  console.log('\n----------------------------------------------------\n');

  // 8. Analytics Metrics Calculation
  console.log('8. TESTING calculateAttendanceMetrics METRICS:');
  const subjectList = [{ id: subjectUuid, code: slotCode, name: 'MLOps Laboratory', target_percentage: 75 }];
  const metrics = calculateAttendanceMetrics(subjectList, fetchedLogs);
  console.log('   Overall Metrics:', JSON.stringify(metrics.overall));
  console.log('   Subject Metrics:', JSON.stringify(metrics.subjectMetrics[0]));

  console.log('\n----------------------------------------------------\n');

  // Cleanup
  await supabase
    .from('attendance_logs')
    .delete()
    .eq('student_id', testStudentId)
    .eq('date', testDate);

  console.log('DEEP TRACE COMPLETE.');
}

runDeepTrace().catch(console.error);
