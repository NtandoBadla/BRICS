const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('User')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testSupabaseConnection();