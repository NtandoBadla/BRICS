const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createTeamManager() {
  try {
    const hashedPassword = await bcrypt.hash('manager123', 10);
    
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          id: uuidv4(),
          email: 'manager@bifa.com',
          password: hashedPassword,
          firstName: 'Team',
          lastName: 'Manager',
          role: 'TEAM_MANAGER'
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️ Team manager already exists');
      } else {
        console.error('❌ Error creating team manager:', error.message);
      }
    } else {
      console.log('✅ Created team manager: manager@bifa.com / manager123');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTeamManager();