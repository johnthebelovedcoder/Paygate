import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Sample user data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error connecting to Supabase:');
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
