const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// These variables would be needed if you use Supabase for more than just the database,
// like for authentication or storage.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// The Supabase client is initialized with the project URL and anon key.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;