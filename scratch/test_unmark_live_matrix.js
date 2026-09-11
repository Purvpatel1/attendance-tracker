import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { supabase } = await import('../src/lib/supabaseClient.js');
const { saveAttendanceLog, fetchStudentLogs } = await import('../src/services/attendanceService.js');

async function testUnmarkMatrix() {
  console.log('========================================================');
  console.log('RUNNING LIVE SUPABASE UNMARKING MATRIX TEST');
  console.log('========================================================\n');

  const timestamp = Date.now();
  const email = `test_unmark_${timestamp}@example.com`;
  const password = 'Password123!';

  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Unmark Matrix User', roll_number: '26095', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  let user = signUpData?.user;
  if (!signUpData?.session && user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    user = signInData?.user;
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Unmark Matrix User',
    roll_number: '26095',
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
  });

  const { data: subjects } = await supabase.from('subjects').select('id').limit(1);
  const subjectId = subjects[0].id;
  const { data: slots } = await supabase.from('timetable_slots').select('id').limit(1);
  const slotId = slots[0].id;

  console.log('User ID:', user.id);

  // 1. Create extra lecture
  const { data: exData } = await supabase.from('extra_lectures').insert({
    student_id: user.id,
    subject_id: subjectId,
    date: '2026-09-12',
    start_time: '14:00',
    end_time: '16:00',
  }).select();
  const extraId = exData[0].id;

  const statuses = ['PRESENT', 'ABSENT', 'CANCELLED'];

  // --- RECURRING TESTS ---
  console.log('--- RECURRING TIMETABLE UNMARKING TESTS ---');
  for (const status of statuses) {
    console.log(`\nTesting Recurring ${status} -> UNMARKED:`);
    // Step 1: Mark status
    const saveRes = await saveAttendanceLog({
      studentId: user.id,
      subjectId,
      slotId,
      extraLectureId: null,
      date: '2026-09-12',
      hourIndex: 1,
      status: status,
    });
    console.log(`  Mark ${status} result:`, saveRes.success);

    // Step 2: Unmark status
    const unmarkRes = await saveAttendanceLog({
      studentId: user.id,
      subjectId,
      slotId,
      extraLectureId: null,
      date: '2026-09-12',
      hourIndex: 1,
      status: 'UNMARKED',
    });
    console.log(`  Unmark result:`, unmarkRes);

    // Step 3: Fetch from Supabase (simulating page refresh)
    const logsAfterRefresh = await fetchStudentLogs(user.id);
    const foundLog = logsAfterRefresh.find(l => l.slot_id === slotId && l.date === '2026-09-12' && Number(l.hour_index) === 1);
    console.log(`  Found log after refresh?`, Boolean(foundLog));
    if (foundLog) {
      console.error(`  ❌ FAILED: Row still present in DB for Recurring ${status} -> UNMARKED!`);
    } else {
      console.log(`  ✅ PASSED: Row successfully deleted from DB for Recurring ${status} -> UNMARKED!`);
    }
  }

  // --- EXTRA LECTURE TESTS ---
  console.log('\n--- EXTRA LECTURE UNMARKING TESTS ---');
  for (const status of statuses) {
    console.log(`\nTesting Extra Lecture ${status} -> UNMARKED:`);
    // Step 1: Mark status
    const saveRes = await saveAttendanceLog({
      studentId: user.id,
      subjectId,
      slotId: null,
      extraLectureId: extraId,
      date: '2026-09-12',
      hourIndex: 1,
      status: status,
    });
    console.log(`  Mark ${status} result:`, saveRes.success);

    // Step 2: Unmark status
    const unmarkRes = await saveAttendanceLog({
      studentId: user.id,
      subjectId,
      slotId: null,
      extraLectureId: extraId,
      date: '2026-09-12',
      hourIndex: 1,
      status: 'UNMARKED',
    });
    console.log(`  Unmark result:`, unmarkRes);

    // Step 3: Fetch from Supabase (simulating page refresh)
    const logsAfterRefresh = await fetchStudentLogs(user.id);
    const foundLog = logsAfterRefresh.find(l => l.extra_lecture_id === extraId && l.date === '2026-09-12' && Number(l.hour_index) === 1);
    console.log(`  Found log after refresh?`, Boolean(foundLog));
    if (foundLog) {
      console.error(`  ❌ FAILED: Row still present in DB for Extra Lecture ${status} -> UNMARKED!`);
    } else {
      console.log(`  ✅ PASSED: Row successfully deleted from DB for Extra Lecture ${status} -> UNMARKED!`);
    }
  }
}

testUnmarkMatrix().catch(console.error);
