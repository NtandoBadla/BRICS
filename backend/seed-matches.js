const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding matches, competitions, and teams...');

  // Create or find secretariat user
  const hashedPassword = await bcrypt.hash('secretariat123', 10);
  const secretariat = await prisma.user.upsert({
    where: { email: 'secretariat@bifa.com' },
    update: {},
    create: {
      email: 'secretariat@bifa.com',
      password: hashedPassword,
      firstName: 'BIFA',
      lastName: 'Secretariat',
      role: 'SECRETARIAT'
    }
  });

  console.log('✅ Secretariat user created:', secretariat.email);

  // Create teams
  const teams = [
    {
      name: 'FC Bujumbura',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    },
    {
      name: 'Vital\'O FC',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    },
    {
      name: 'Le Messager Ngozi',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    },
    {
      name: 'Aigle Noir',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    },
    {
      name: 'Flambeau du Centre',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    },
    {
      name: 'Olympic Star',
      federation: 'Burundi Football Federation',
      country: 'Burundi'
    }
  ];

  const createdTeams = [];
  for (const teamData of teams) {
    const team = await prisma.team.upsert({
      where: { name: teamData.name },
      update: {},
      create: teamData
    });
    createdTeams.push(team);
    console.log(`✅ Team created: ${team.name}`);
  }

  // Create competitions by secretariat
  const competition1 = await prisma.competition.create({
    data: {
      name: 'BRICS Premier League 2024',
      description: 'Annual premier league championship featuring top teams',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-20'),
      location: 'Burundi',
      format: 'LEAGUE',
      status: 'UPCOMING',
      createdBy: secretariat.id
    }
  });

  const competition2 = await prisma.competition.create({
    data: {
      name: 'BRICS Cup 2024',
      description: 'Knockout cup competition',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      location: 'Burundi',
      format: 'KNOCKOUT',
      status: 'UPCOMING',
      createdBy: secretariat.id
    }
  });

  const competition3 = await prisma.competition.create({
    data: {
      name: 'BRICS Super Cup 2024',
      description: 'Season opening super cup',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-15'),
      location: 'Bujumbura',
      format: 'KNOCKOUT',
      status: 'UPCOMING',
      createdBy: secretariat.id
    }
  });

  console.log('✅ Competitions created:', [competition1.name, competition2.name, competition3.name]);

  // Create matches for Premier League
  const matches = [
    {
      competitionId: competition1.id,
      homeTeamId: createdTeams[0].id,
      awayTeamId: createdTeams[1].id,
      scheduledAt: new Date('2024-02-10T15:00:00'),
      venue: 'Prince Louis Rwagasore Stadium',
      status: 'SCHEDULED'
    },
    {
      competitionId: competition1.id,
      homeTeamId: createdTeams[2].id,
      awayTeamId: createdTeams[3].id,
      scheduledAt: new Date('2024-02-11T17:00:00'),
      venue: 'Ngozi Stadium',
      status: 'SCHEDULED'
    },
    {
      competitionId: competition1.id,
      homeTeamId: createdTeams[4].id,
      awayTeamId: createdTeams[5].id,
      scheduledAt: new Date('2024-02-12T14:00:00'),
      venue: 'Gitega Stadium',
      status: 'SCHEDULED'
    },
    {
      competitionId: competition1.id,
      homeTeamId: createdTeams[1].id,
      awayTeamId: createdTeams[2].id,
      scheduledAt: new Date('2024-02-17T15:00:00'),
      venue: 'Intwari Stadium',
      status: 'SCHEDULED'
    },
    // Cup matches
    {
      competitionId: competition2.id,
      homeTeamId: createdTeams[0].id,
      awayTeamId: createdTeams[3].id,
      scheduledAt: new Date('2024-03-15T14:00:00'),
      venue: 'Prince Louis Rwagasore Stadium',
      status: 'SCHEDULED'
    },
    {
      competitionId: competition2.id,
      homeTeamId: createdTeams[1].id,
      awayTeamId: createdTeams[4].id,
      scheduledAt: new Date('2024-03-16T16:00:00'),
      venue: 'Intwari Stadium',
      status: 'SCHEDULED'
    },
    // Super Cup match
    {
      competitionId: competition3.id,
      homeTeamId: createdTeams[0].id,
      awayTeamId: createdTeams[1].id,
      scheduledAt: new Date('2024-02-05T18:00:00'),
      venue: 'Prince Louis Rwagasore Stadium',
      status: 'SCHEDULED'
    }
  ];

  for (const matchData of matches) {
    const match = await prisma.match.create({
      data: matchData,
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      }
    });
    console.log(`✅ Match created: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Teams: ${createdTeams.length}`);
  console.log(`   - Competitions: 3`);
  console.log(`   - Matches: ${matches.length}`);
  console.log(`\n🔐 Secretariat Login:`);
  console.log(`   Email: secretariat@bifa.com`);
  console.log(`   Password: secretariat123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding data:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
