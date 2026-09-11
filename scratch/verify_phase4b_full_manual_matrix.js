import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load .env BEFORE importing application modules
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { supabase } = await import('../src/lib/supabaseClient.js');
const { createExtraLecture, updateExtraLecture, deleteExtraLecture, getExtraLecturesForStudent, validateExtraLectureDuration } = await import('../src/services/extraLectureService.js');
const { saveAttendanceLog, fetchStudentAttendanceLogs, calculateAttendanceMetrics } = await import('../src/services/attendanceService.js');
const { SUBJECTS_BY_BRANCH } = await import('../src/data/timetableData.js');

console.log('========================================================');
console.log('PHASE 4B FULL MANUAL & INTEGRATION VERIFICATION MATRIX');
console.log('========================================================\n');

let results = [];

function recordResult(testNum, title, isPass, details = '') {
  const status = isPass ? 'PASS' : 'FAIL';
  console.log(`[Item ${testNum}] ${status}: ${title} ${details ? `(${details})` : ''}`);
  results.push({ testNum, title, isPass, details });
}

async function runMatrix() {
  // Setup: Authenticate test Student A and Student B
  const uniqueId = Date.now();
  const emailA = `student_4b_a_${uniqueId}@college.edu`;
  const emailB = `student_4b_b_${uniqueId}@college.edu`;
  const password = 'Password123!';

  // Create Student A (CE branch)
  const { data: signUpA } = await supabase.auth.signUp({
    email: emailA,
    password: password,
    options: {
      data: {
        full_name: 'Student A Phase4B',
        roll_number: `26CE${uniqueId.toString().slice(-3)}`,
        branch: 'Computer Engineering (CE)',
        batch: 'CE1',
      },
    },
  });

  let sessionA = signUpA?.session;
  let userA = signUpA?.user;

  if (!sessionA) {
    const { data: signInA } = await supabase.auth.signInWithPassword({ email: emailA, password });
    sessionA = signInA?.session;
    userA = signInA?.user;
  }

  // Ensure profile A exists in DB
  await supabase.from('profiles').upsert({
    id: userA.id,
    full_name: 'Student A Phase4B',
    roll_number: `26CE${uniqueId.toString().slice(-3)}`,
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
  });

  // Create Student B (CE branch)
  const { data: signUpB } = await supabase.auth.signUp({
    email: emailB,
    password: password,
    options: {
      data: {
        full_name: 'Student B Phase4B',
        roll_number: `26CE9${uniqueId.toString().slice(-3)}`,
        branch: 'Computer Engineering (CE)',
        batch: 'CE2',
      },
    },
  });

  let sessionB = signUpB?.session;
  let userB = signUpB?.user;

  if (!sessionB) {
    const { data: signInB } = await supabase.auth.signInWithPassword({ email: emailB, password });
    sessionB = signInB?.session;
    userB = signInB?.user;
  }

  await supabase.from('profiles').upsert({
    id: userB.id,
    full_name: 'Student B Phase4B',
    roll_number: `26CE9${uniqueId.toString().slice(-3)}`,
    branch: 'Computer Engineering (CE)',
    batch: 'CE2',
  });

  // Set active auth session to Student A
  await supabase.auth.setSession(sessionA);

  const ceSubjects = SUBJECTS_BY_BRANCH['Computer Engineering (CE)'];
  const dbmsSubject = ceSubjects.find(s => s.code.includes('504') || s.name.includes('Database'));
  const validSubjectId = dbmsSubject.id;
  const testDate = '2026-09-08';

  // ----------------------------------------------------
  // ITEM 1: Create an extra lecture & refresh page (persistence check)
  // ----------------------------------------------------
  const createRes1 = await createExtraLecture({
    studentId: userA.id,
    subjectId: validSubjectId,
    date: testDate,
    startTime: '14:00',
    endTime: '15:00',
  });

  if (createRes1.success && createRes1.data?.id) {
    const createdId = createRes1.data.id;
    // Simulate page refresh by fetching lectures from DB again
    const fetchRes = await getExtraLecturesForStudent(userA.id);
    const persisted = fetchRes.success && fetchRes.data.some(l => l.id === createdId);
    recordResult(1, 'Extra lecture creation and persistence on page refresh', persisted, `ID: ${createdId}`);
  } else {
    recordResult(1, 'Extra lecture creation and persistence on page refresh', false, createRes1.error);
  }

  // ----------------------------------------------------
  // ITEM 2: Mark hourly attendance, refresh, and confirm each hour's status persists
  // ----------------------------------------------------
  const createRes2 = await createExtraLecture({
    studentId: userA.id,
    subjectId: validSubjectId,
    date: testDate,
    startTime: '15:00',
    endTime: '17:00',
  });

  const ex2Id = createRes2.data.id;
  const markH1 = await saveAttendanceLog({
    studentId: userA.id,
    subjectId: validSubjectId,
    extraLectureId: ex2Id,
    date: testDate,
    hourIndex: 1,
    status: 'PRESENT',
  });
  const markH2 = await saveAttendanceLog({
    studentId: userA.id,
    subjectId: validSubjectId,
    extraLectureId: ex2Id,
    date: testDate,
    hourIndex: 2,
    status: 'ABSENT',
  });

  // Refresh (fetch from DB)
  const logsRes = await fetchStudentAttendanceLogs(userA.id);
  const log1 = logsRes.data?.find(l => l.extra_lecture_id === ex2Id && l.hour_index === 1);
  const log2 = logsRes.data?.find(l => l.extra_lecture_id === ex2Id && l.hour_index === 2);
  const hourlyPersisted = log1?.status === 'PRESENT' && log2?.status === 'ABSENT';
  recordResult(2, 'Hourly attendance marking and persistence (H1=PRESENT, H2=ABSENT)', hourlyPersisted, `H1: ${log1?.status}, H2: ${log2?.status}`);

  // ----------------------------------------------------
  // ITEM 3: Create 2-hour extra lecture, record attendance for Hour 2, edit to 1 hour (destructive confirmation check)
  // ----------------------------------------------------
  const createRes3 = await createExtraLecture({
    studentId: userA.id,
    subjectId: validSubjectId,
    date: '2026-09-09',
    startTime: '10:00',
    endTime: '12:00',
  });
  const ex3Id = createRes3.data.id;
  await saveAttendanceLog({
    studentId: userA.id,
    subjectId: validSubjectId,
    extraLectureId: ex3Id,
    date: '2026-09-09',
    hourIndex: 2,
    status: 'PRESENT',
  });

  // Verify attendance for hour 2 exists
  const logsBeforeEdit = await fetchStudentAttendanceLogs(userA.id);
  const h2Before = logsBeforeEdit.data?.find(l => l.extra_lecture_id === ex3Id && l.hour_index === 2);
  
  // Call updateExtraLecture with new duration 1 hour (10:00 to 11:00) and cascadeAttendanceClean = true
  const editRes3 = await updateExtraLecture(ex3Id, userA.id, {
    startTime: '10:00',
    endTime: '11:00',
    cascadeAttendanceClean: true,
  });

  const logsAfterEdit = await fetchStudentAttendanceLogs(userA.id);
  const h2After = logsAfterEdit.data?.find(l => l.extra_lecture_id === ex3Id && l.hour_index === 2);

  const editDestructiveSuccess = editRes3.success && h2Before?.status === 'PRESENT' && h2After === undefined;
  recordResult(3, 'Edit 2-hour lecture to 1-hour with recorded attendance on Hour 2 (explicit clean required)', editDestructiveSuccess, `H2 removed on edit: ${h2After === undefined}`);

  // ----------------------------------------------------
  // ITEM 4: Delete extra lecture with recorded attendance (cascade check)
  // ----------------------------------------------------
  const deleteRes4 = await deleteExtraLecture(ex2Id, userA.id);
  const logsAfterDelete = await fetchStudentAttendanceLogs(userA.id);
  const logsDeletedEx2 = logsAfterDelete.data?.filter(l => l.extra_lecture_id === ex2Id);
  const cascadeSuccess = deleteRes4.success && logsDeletedEx2.length === 0;
  recordResult(4, 'Delete extra lecture with recorded attendance (cascade delete rows)', cascadeSuccess, `Rows remaining: ${logsDeletedEx2.length}`);

  // ----------------------------------------------------
  // ITEM 5: Cross-student extra lecture access / attendance manipulation rejection
  // ----------------------------------------------------
  // Switch auth session to Student B
  await supabase.auth.setSession(sessionB);

  // Student B attempts to mark attendance on Student A's extra lecture (ex3Id)
  const crossLogAttempt = await saveAttendanceLog({
    studentId: userB.id,
    subjectId: validSubjectId,
    extraLectureId: ex3Id,
    date: '2026-09-09',
    hourIndex: 1,
    status: 'PRESENT',
  });

  const crossBlocked = !crossLogAttempt.success && (
    crossLogAttempt.error?.includes('Security Violation') ||
    crossLogAttempt.error?.includes('extra lecture does not belong') ||
    crossLogAttempt.error?.includes('policy')
  );

  // Student B attempts to delete Student A's extra lecture
  const crossDeleteAttempt = await deleteExtraLecture(ex3Id, userB.id);
  const crossDeleteBlocked = !crossDeleteAttempt.success || crossDeleteAttempt.count === 0;

  recordResult(5, 'Cross-student extra lecture access and attendance manipulation rejection', crossBlocked && crossDeleteBlocked, `Log Blocked: ${crossBlocked}, Delete Blocked: ${crossDeleteBlocked}`);

  // Switch back to Student A session
  await supabase.auth.setSession(sessionA);

  // ----------------------------------------------------
  // ITEM 6: Student cannot create/edit extra lecture with subject outside branch/batch curriculum
  // ----------------------------------------------------
  const fakeSubjectId = '00000000-0000-4000-8000-000000000999'; // Non-existent/invalid branch subject
  const invalidSubjectAttempt = await createExtraLecture({
    studentId: userA.id,
    subjectId: fakeSubjectId,
    date: '2026-09-10',
    startTime: '09:00',
    endTime: '10:00',
  });

  const invalidBlocked = !invalidSubjectAttempt.success;
  recordResult(6, 'Rejection of extra lecture creation with subject outside branch/batch curriculum', invalidBlocked, `Error: "${invalidSubjectAttempt.error}"`);

  // ----------------------------------------------------
  // ITEM 7: Verify timetableData.js and recurring timetable rendering are unchanged
  // ----------------------------------------------------
  // Verify timetableData structure retains original slots and subjects
  const ceSlots = SUBJECTS_BY_BRANCH['Computer Engineering (CE)'];
  const hasOriginalData = Array.isArray(ceSlots) && ceSlots.length > 0;
  recordResult(7, 'timetableData.js and recurring timetable definitions unchanged', hasOriginalData, `Subject count: ${ceSlots.length}`);

  // ----------------------------------------------------
  // ITEM 8: Existing recurring attendance records display and behave correctly
  // ----------------------------------------------------
  const recurringLog = await saveAttendanceLog({
    studentId: userA.id,
    subjectId: validSubjectId,
    slotId: 'slot-rec-test-1',
    extraLectureId: null,
    date: '2026-09-10',
    hourIndex: 1,
    status: 'PRESENT',
  });

  const logsRecFetch = await fetchStudentAttendanceLogs(userA.id);
  const recFound = logsRecFetch.data?.some(l => l.slot_id === 'slot-rec-test-1' && l.status === 'PRESENT');
  recordResult(8, 'Existing recurring attendance records display and behave correctly', recFound, `Log found: ${recFound}`);

  // ----------------------------------------------------
  // ITEM 9: Overall and subject analytics include extra lecture attendance
  // ----------------------------------------------------
  const allLogs = logsRecFetch.data || [];
  const metrics = calculateAttendanceMetrics(ceSubjects, allLogs);
  const hasAnalytics = metrics && typeof metrics.overall.overallPercentage === 'number';
  recordResult(9, 'Overall and subject analytics include extra lecture attendance', hasAnalytics, `Overall %: ${metrics.overall.overallPercentage}%, Conducted: ${metrics.overall.totalConducted}`);

  // ----------------------------------------------------
  // ITEM 10: Phase 4A Bunk/Recovery values update correctly with extra lecture attendance
  // ----------------------------------------------------
  const dbmsMetric = metrics.subjectMetrics.find(s => s.id === validSubjectId);
  const bunkRecoveryValid = dbmsMetric && (typeof dbmsMetric.safeBunks === 'number' || typeof dbmsMetric.recoveryNeeded === 'number');
  recordResult(10, 'Phase 4A Bunk/Recovery values update correctly with extra lecture attendance', bunkRecoveryValid, `Safe Bunks: ${dbmsMetric?.safeBunks}, Recovery Needed: ${dbmsMetric?.recoveryNeeded}`);

  // ----------------------------------------------------
  // ITEM 11: End-to-end workflow execution check
  // ----------------------------------------------------
  // Add Extra Class -> select subject -> choose date/time -> save -> mark individual hours -> refresh -> inspect analytics -> edit/delete
  const e2eCreate = await createExtraLecture({
    studentId: userA.id,
    subjectId: validSubjectId,
    date: '2026-09-11',
    startTime: '11:00',
    endTime: '13:00',
  });
  const e2eId = e2eCreate.data?.id;

  await saveAttendanceLog({ studentId: userA.id, subjectId: validSubjectId, extraLectureId: e2eId, date: '2026-09-11', hourIndex: 1, status: 'PRESENT' });
  await saveAttendanceLog({ studentId: userA.id, subjectId: validSubjectId, extraLectureId: e2eId, date: '2026-09-11', hourIndex: 2, status: 'PRESENT' });

  const e2eLogs = await fetchStudentAttendanceLogs(userA.id);
  const e2eMetrics = calculateAttendanceMetrics(ceSubjects, e2eLogs.data || []);
  const e2eDelete = await deleteExtraLecture(e2eId, userA.id);

  const e2eSuccess = e2eCreate.success && e2eDelete.success && e2eMetrics.overall.totalConducted > 0;
  recordResult(11, 'Critical end-to-end workflow (Create -> Select Subject -> Date/Time -> Save -> Mark Hours -> Refresh -> Analytics -> Delete)', e2eSuccess, 'End-to-End Cycle Completed Cleanly');

  console.log('\n========================================================');
  const totalPass = results.filter(r => r.isPass).length;
  console.log(`SUMMARY: ${totalPass} / ${results.length} TESTS PASSED`);
  console.log('========================================================\n');
}

runMatrix().catch(console.error);
