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

async function detailedInvestigation() {
  console.log('=== DETAILED BUG 2 INVESTIGATION ===');

  const timestamp = Date.now();
  const email = `test_inv2_${timestamp}@example.com`;
  const password = 'Password123!';

  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Inv2 User', roll_number: '26098', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  let user = signUpData?.user;
  if (!signUpData?.session && user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    user = signInData?.user;
  }

  console.log('1. Authenticated auth.uid():', user.id);

  // Check auth session
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Session user ID:', sessionData?.session?.user?.id);

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Inv2 User',
    roll_number: '26098',
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
  });

  const { data: subjects } = await supabase.from('subjects').select('id').limit(1);
  const subjectId = subjects[0].id;
  const { data: slots } = await supabase.from('timetable_slots').select('id').limit(1);
  const slotId = slots[0].id;

  // Insert a test attendance log
  const recPayload = {
    student_id: user.id,
    subject_id: subjectId,
    slot_id: slotId,
    extra_lecture_id: null,
    date: '2026-09-12',
    hour_index: 1,
    status: 'PRESENT'
  };

  const { data: insRow, error: insErr } = await supabase
    .from('attendance_logs')
    .upsert(recPayload, { onConflict: 'student_id,date,slot_id,hour_index' })
    .select();

  console.log('Inserted Row:', insRow?.[0]);
  const rowId = insRow?.[0]?.id;

  // Test 7A: Delete WITHOUT .select()
  console.log('\n--- Testing DELETE WITHOUT .select() ---');
  const resNoSelect = await supabase
    .from('attendance_logs')
    .delete({ count: 'exact' })
    .eq('id', rowId);
  console.log('Result without .select():', { error: resNoSelect.error, count: resNoSelect.count, status: resNoSelect.status, statusText: resNoSelect.statusText });

  // Verify row existence
  const { data: check1 } = await supabase.from('attendance_logs').select('*').eq('id', rowId);
  console.log('Row present after delete-by-id attempt?', check1.length > 0 ? 'YES (STILL THERE)' : 'NO (DELETED)');

  // Test 7B: What if we try deleting by exact columns without .select()?
  if (check1.length > 0) {
    console.log('\n--- Testing DELETE by exact columns without .select() ---');
    const resColsNoSelect = await supabase
      .from('attendance_logs')
      .delete({ count: 'exact' })
      .eq('student_id', user.id)
      .eq('date', '2026-09-12')
      .eq('slot_id', slotId)
      .eq('hour_index', 1);
    console.log('Result cols without .select():', { error: resColsNoSelect.error, count: resColsNoSelect.count });
  }

  // Final check
  const { data: check2 } = await supabase.from('attendance_logs').select('*').eq('id', rowId);
  console.log('Final check: Row present?', check2.length > 0 ? 'YES' : 'NO');
}

detailedInvestigation().catch(console.error);
