const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testDatabaseCounts() {
  try {
    console.log('🔍 Testing database counts...\n');
    
    const [users, referees, competitions, matches, teams] = await Promise.all([
      prisma.user.count(),
      prisma.referee.count(),
      prisma.competition.count(),
      prisma.match.count(),
      prisma.team.count()
    ]);

    console.log('Database Counts:');
    console.log(`Users: ${users}`);
    console.log(`Referees: ${referees}`);
    console.log(`Competitions: ${competitions}`);
    console.log(`Matches: ${matches}`);
    console.log(`Teams: ${teams}`);
    
    // Also check if there are any competitions with details
    const competitionsList = await prisma.competition.findMany({
      select: { id: true, name: true, status: true }
    });
    
    console.log(`\nCompetitions in database:`);
    competitionsList.forEach(comp => {
      console.log(`- ${comp.name} (${comp.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseCounts();