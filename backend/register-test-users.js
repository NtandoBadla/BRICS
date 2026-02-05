const testUsers = [
  {
    email: 'agent@bifa.com',
    password: 'agent123',
    firstName: 'John',
    lastName: 'Agent',
    role: 'AGENT'
  },
  {
    email: 'player@bifa.com',
    password: 'player123',
    firstName: 'Mike',
    lastName: 'Player',
    role: 'PLAYER'
  },
  {
    email: 'coach@bifa.com',
    password: 'coach123',
    firstName: 'Sarah',
    lastName: 'Coach',
    role: 'COACH'
  }
];

async function registerTestUsers() {
  const baseUrl = 'https://brics-platform.onrender.com'; // Using deployed backend
  
  console.log('Registering test users...');
  
  for (const user of testUsers) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Registered: ${user.email} (${user.role})`);
      } else {
        console.log(`⚠️ ${user.email}: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error registering ${user.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Registration complete!');
  console.log('\nLogin credentials:');
  console.log('Agent: agent@bifa.com / agent123 → /agent');
  console.log('Player: player@bifa.com / player123 → /player');
  console.log('Coach: coach@bifa.com / coach123 → /coach');
  console.log('Admin: admin@bifa.com / admin123 → /admin');
}

registerTestUsers();