import fs from 'fs';
import path from 'path';

// Load .env variables BEFORE importing supabaseClient
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const { supabase } = await import('../src/lib/supabaseClient.js');
const { createExtraLecture, deleteExtraLecture } = await import('../src/services/extraLectureService.js');
const { saveAttendanceLog } = await import('../src/services/attendanceService.js');

async function runSecurityMatrix() {
  console.log('====================================================');
  console.log('RUNNING PHASE 4B SECURITY & DATABASE INTEGRITY TESTS');
  console.log('====================================================\n');

  const studentA = 'd3b07384-d113-4610-a292-628b030b65f7';
  const studentB = 'a1111111-2222-3333-4444-555555555555'; // Different student ID
  const testDate = '2026-09-09';
  const validSubjectId = 'ac6094de-e83c-40eb-836f-a2064c333ff0'; // DBMS in CE curriculum

  // Step 1: Create an extra lecture for Student A
  console.log('1. Creating Extra Lecture for Student A...');
  const createRes = await createExtraLecture({
    studentId: studentA,
    subjectId: validSubjectId,
    date: testDate,
    startTime: '14:00',
    endTime: '16:00',
  });

  if (!createRes.success) {
    console.error('Failed to create test extra lecture:', createRes.error);
    return;
  }

  const extraLectureId = createRes.data.id;
  console.log('   Created Extra Lecture ID:', extraLectureId);

  // Step 2: Security Test 1 - Attempt cross-student attendance manipulation
  console.log('\n2. Security Test: Student B attempts to attach attendance log to Student A\'s extra_lecture_id...');
  const crossLogPayload = {
    studentId: studentB,
    subjectId: validSubjectId,
    slotId: null,
    extraLectureId: extraLectureId,
    date: testDate,
    hourIndex: 1,
    status: 'PRESENT',
  };

  const crossRes = await saveAttendanceLog(crossLogPayload);
  const triggerBlocked = !crossRes.success && (
    crossRes.error?.includes('Security Violation') || 
    crossRes.error?.includes('extra lecture does not belong')
  );

  console.log('   Cross-Student Log Attempt Result:', JSON.stringify(crossRes));
  console.log('   Security Trigger Protection Status:', triggerBlocked ? '✅ BLOCKED BY TRIGGER' : '❌ ALLOWED (FAIL)');

  // Step 3: Student A marks attendance on their own extra lecture
  console.log('\n3. Student A marks Hour 1 = PRESENT, Hour 2 = ABSENT on their extra lecture...');
  await saveAttendanceLog({
    studentId: studentA,
    subjectId: validSubjectId,
    extraLectureId: extraLectureId,
    date: testDate,
    hourIndex: 1,
    status: 'PRESENT',
  });

  await saveAttendanceLog({
    studentId: studentA,
    subjectId: validSubjectId,
    extraLectureId: extraLectureId,
    date: testDate,
    hourIndex: 2,
    status: 'ABSENT',
  });

  // Verify 2 rows exist in attendance_logs
  const { data: logsBeforeDelete } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('extra_lecture_id', extraLectureId);
  console.log('   Attendance Logs Count Before Delete:', logsBeforeDelete.length);

  // Step 4: Cascade Delete Verification
  console.log('\n4. Deleting Extra Lecture (Cascade Delete Verification)...');
  await deleteExtraLecture(extraLectureId, studentA);

  const { data: logsAfterDelete } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('extra_lecture_id', extraLectureId);

  console.log('   Attendance Logs Count After Delete:', logsAfterDelete.length);
  const cascadePassed = logsBeforeDelete.length === 2 && logsAfterDelete.length === 0;
  console.log('   Cascade Delete Verification Status:', cascadePassed ? '✅ CASCADE DELETED' : '❌ FAIL');

  console.log('\nSECURITY MATRIX COMPLETE.');
}

runSecurityMatrix().catch(console.error);
