const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding competitions and matches...');

  // Create teams first
  const team1 = await prisma.team.upsert({
    where: { name: 'FC Bujumbura' },
    update: {},
    create: {
      name: 'FC Bujumbura',
      country: 'Burundi',
      founded: 2010,
      stadium: 'Prince Louis Rwagasore Stadium'
    }
  });

  const team2 = await prisma.team.upsert({
    where: { name: 'Vital\'O FC' },
    update: {},
    create: {
      name: 'Vital\'O FC',
      country: 'Burundi',
      founded: 2008,
      stadium: 'Intwari Stadium'
    }
  });

  const team3 = await prisma.team.upsert({
    where: { name: 'Le Messager Ngozi' },
    update: {},
    create: {
      name: 'Le Messager Ngozi',
      country: 'Burundi',
      founded: 2005,
      stadium: 'Ngozi Stadium'
    }
  });

  const team4 = await prisma.team.upsert({
    where: { name: 'Aigle Noir' },
    update: {},
    create: {
      name: 'Aigle Noir',
      country: 'Burundi',
      founded: 2012,
      stadium: 'Makamba Stadium'
    }
  });

  console.log('Teams created:', { team1, team2, team3, team4 });

  // Create competitions
  const competition1 = await prisma.competition.create({
    data: {
      name: 'BRICS Premier League 2024',
      description: 'Annual premier league championship',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-20'),
      location: 'Burundi',
      format: 'LEAGUE',
      status: 'ACTIVE'
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
      status: 'ACTIVE'
    }
  });

  console.log('Competitions created:', { competition1, competition2 });

  // Create matches
  const match1 = await prisma.match.create({
    data: {
      competitionId: competition1.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      scheduledAt: new Date('2024-02-10T15:00:00'),
      venue: 'Prince Louis Rwagasore Stadium',
      status: 'SCHEDULED'
    }
  });

  const match2 = await prisma.match.create({
    data: {
      competitionId: competition1.id,
      homeTeamId: team3.id,
      awayTeamId: team4.id,
      scheduledAt: new Date('2024-02-11T17:00:00'),
      venue: 'Ngozi Stadium',
      status: 'SCHEDULED'
    }
  });

  const match3 = await prisma.match.create({
    data: {
      competitionId: competition2.id,
      homeTeamId: team1.id,
      awayTeamId: team3.id,
      scheduledAt: new Date('2024-03-15T14:00:00'),
      venue: 'Prince Louis Rwagasore Stadium',
      status: 'SCHEDULED'
    }
  });

  const match4 = await prisma.match.create({
    data: {
      competitionId: competition2.id,
      homeTeamId: team2.id,
      awayTeamId: team4.id,
      scheduledAt: new Date('2024-03-16T16:00:00'),
      venue: 'Intwari Stadium',
      status: 'SCHEDULED'
    }
  });

  console.log('Matches created:', { match1, match2, match3, match4 });

  console.log('✅ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding data:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
