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

async function testSqlExec() {
  console.log('Testing RPC calls if any exist...');
  // Try common rpc names if any
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql', 'apply_migration'];
  for (const rpcName of rpcs) {
    const { data, error } = await supabase.rpc(rpcName, { query: 'SELECT 1;' });
    console.log(`RPC ${rpcName}:`, { data, error });
  }
}

testSqlExec().catch(console.error);
