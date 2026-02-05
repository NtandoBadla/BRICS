const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users...');

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

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Agent: agent@bifa.com / agent123');
    console.log('Player: player@bifa.com / player123');
    console.log('Coach: coach@bifa.com / coach123');
    console.log('Admin: admin@bifa.com / admin123 (hardcoded)');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();