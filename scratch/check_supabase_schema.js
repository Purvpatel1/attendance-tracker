import { supabase } from '../src/lib/supabaseClient.js';

async function checkSchema() {
  console.log('=== CHECKING POSTGREST SCHEMA CACHE FOR ATTENDANCE_LOGS ===');
  
  // Try querying attendance_logs columns
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching attendance_logs:', error);
  } else {
    console.log('Sample row structure returned by PostgREST:');
    if (data && data.length > 0) {
      console.log('Columns in row:', Object.keys(data[0]));
      console.log('Sample data:', data[0]);
    } else {
      console.log('No rows returned, but query succeeded.');
    }
  }

  // Try inserting a test payload with hour_index
  const testPayload = {
    student_id: 'd3b07384-d113-4610-a292-628b030b65f7',
    subject_id: 'ec5eac3b-a1c0-416c-81e7-3c34fe7d6b34',
    slot_id: '97ddd8e7-9fac-48fd-86b5-c14c875f487d',
    date: '2026-09-07',
    hour_index: 1,
    status: 'PRESENT'
  };

  console.log('\nTesting upsert with hour_index payload:');
  const { data: upsertData, error: upsertError } = await supabase
    .from('attendance_logs')
    .upsert(testPayload, { onConflict: 'student_id,date,slot_id,subject_id,hour_index' })
    .select();

  if (upsertError) {
    console.error('Upsert Error:', upsertError);
  } else {
    console.log('Upsert succeeded:', upsertData);
  }
}

checkSchema().catch(console.error);
