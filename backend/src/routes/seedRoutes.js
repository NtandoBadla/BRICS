const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.post('/seed-test-data', async (req, res) => {
  try {
    console.log('Starting test data seeding...');

    // Create teams - South African teams
    const team1 = await prisma.team.create({
      data: {
        name: 'Kaizer Chiefs',
        country: 'South Africa',
        federation: 'SAFA'
      }
    });

    const team2 = await prisma.team.create({
      data: {
        name: 'Orlando Pirates',
        country: 'South Africa',
        federation: 'SAFA'
      }
    });

    const team3 = await prisma.team.create({
      data: {
        name: 'Mamelodi Sundowns',
        country: 'South Africa',
        federation: 'SAFA'
      }
    });

    const team4 = await prisma.team.create({
      data: {
        name: 'SuperSport United',
        country: 'South Africa',
        federation: 'SAFA'
      }
    });

    // Create competitions
    const competition1 = await prisma.competition.create({
      data: {
        name: 'BRICS Premier League 2024',
        description: 'Annual premier league championship',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-20'),
        location: 'South Africa',
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
        location: 'South Africa',
        format: 'KNOCKOUT',
        status: 'ACTIVE'
      }
    });

    // Create matches
    const match1 = await prisma.match.create({
      data: {
        competitionId: competition1.id,
        homeTeamId: team1.id,
        awayTeamId: team2.id,
        scheduledAt: new Date('2024-02-10T15:00:00'),
        venue: 'FNB Stadium',
        status: 'SCHEDULED'
      }
    });

    const match2 = await prisma.match.create({
      data: {
        competitionId: competition1.id,
        homeTeamId: team3.id,
        awayTeamId: team4.id,
        scheduledAt: new Date('2024-02-11T17:00:00'),
        venue: 'Loftus Versfeld Stadium',
        status: 'SCHEDULED'
      }
    });

    const match3 = await prisma.match.create({
      data: {
        competitionId: competition2.id,
        homeTeamId: team1.id,
        awayTeamId: team3.id,
        scheduledAt: new Date('2024-03-15T14:00:00'),
        venue: 'FNB Stadium',
        status: 'SCHEDULED'
      }
    });

    const match4 = await prisma.match.create({
      data: {
        competitionId: competition2.id,
        homeTeamId: team2.id,
        awayTeamId: team4.id,
        scheduledAt: new Date('2024-03-16T16:00:00'),
        venue: 'Orlando Stadium',
        status: 'SCHEDULED'
      }
    });

    res.json({
      success: true,
      message: 'Test data seeded successfully!',
      data: {
        teams: [team1, team2, team3, team4],
        competitions: [competition1, competition2],
        matches: [match1, match2, match3, match4]
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
