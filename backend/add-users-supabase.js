const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addUsersToSupabase() {
  const testUsers = [
    {
      email: 'agent@bifa.com',
      password: 'agent123',
      firstName: 'John',
      lastName: 'Agent',
      role: 'Agent'
    },
    {
      email: 'player@bifa.com',
      password: 'player123',
      firstName: 'Mike',
      lastName: 'Player',
      role: 'Player'
    },
    {
      email: 'coach@bifa.com',
      password: 'coach123',
      firstName: 'Sarah',
      lastName: 'Coach',
      role: 'Coach'
    }
  ];

  console.log('Adding users to Supabase...');

  for (const userData of testUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const { data, error } = await supabase
        .from('User')
        .insert([
          {
            id: uuidv4(),
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️ User ${userData.email} already exists`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
      } else {
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 User creation complete!');
  console.log('\nLogin credentials:');
  console.log('Agent: agent@bifa.com / agent123 → /agent');
  console.log('Player: player@bifa.com / player123 → /player');
  console.log('Coach: coach@bifa.com / coach123 → /coach');
  console.log('Admin: admin@bifa.com / admin123 → /admin');
}

addUsersToSupabase();