import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateMatchResult = async (req, res) => {
  try {
    const { matchId, homeScore, awayScore, events } = req.body;

    // Update match with result
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: 'FULL_TIME'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      }
    });

    // Add match events if provided
    if (events && events.length > 0) {
      await prisma.matchEvent.createMany({
        data: events.map(event => ({
          matchId,
          playerId: event.playerId,
          teamId: event.teamId,
          type: event.type,
          minute: event.minute,
          details: event.details
        }))
      });
    }

    // Update standings
    await updateStandings(match);

    res.json({ message: 'Match result updated successfully', match });
  } catch (error) {
    console.error('Update match result error:', error);
    res.status(500).json({ error: 'Failed to update match result' });
  }
};

const updateStandings = async (match) => {
  const { homeTeamId, awayTeamId, homeScore, awayScore, competitionId } = match;

  // Determine result
  let homePoints = 0, awayPoints = 0;
  let homeWon = 0, homeDraw = 0, homeLost = 0;
  let awayWon = 0, awayDraw = 0, awayLost = 0;

  if (homeScore > awayScore) {
    homePoints = 3; homeWon = 1;
    awayPoints = 0; awayLost = 1;
  } else if (homeScore < awayScore) {
    homePoints = 0; homeLost = 1;
    awayPoints = 3; awayWon = 1;
  } else {
    homePoints = 1; homeDraw = 1;
    awayPoints = 1; awayDraw = 1;
  }

  // Update home team standing
  await prisma.standing.upsert({
    where: {
      competitionId_teamId: {
        competitionId,
        teamId: homeTeamId
      }
    },
    update: {
      played: { increment: 1 },
      won: { increment: homeWon },
      drawn: { increment: homeDraw },
      lost: { increment: homeLost },
      goalsFor: { increment: homeScore },
      goalsAgainst: { increment: awayScore },
      goalDiff: { increment: homeScore - awayScore },
      points: { increment: homePoints }
    },
    create: {
      competitionId,
      teamId: homeTeamId,
      position: 1,
      played: 1,
      won: homeWon,
      drawn: homeDraw,
      lost: homeLost,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
      goalDiff: homeScore - awayScore,
      points: homePoints
    }
  });

  // Update away team standing
  await prisma.standing.upsert({
    where: {
      competitionId_teamId: {
        competitionId,
        teamId: awayTeamId
      }
    },
    update: {
      played: { increment: 1 },
      won: { increment: awayWon },
      drawn: { increment: awayDraw },
      lost: { increment: awayLost },
      goalsFor: { increment: awayScore },
      goalsAgainst: { increment: homeScore },
      goalDiff: { increment: awayScore - homeScore },
      points: { increment: awayPoints }
    },
    create: {
      competitionId,
      teamId: awayTeamId,
      position: 1,
      played: 1,
      won: awayWon,
      drawn: awayDraw,
      lost: awayLost,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
      goalDiff: awayScore - homeScore,
      points: awayPoints
    }
  });

  // Update positions
  await updatePositions(competitionId);
};

const updatePositions = async (competitionId) => {
  const standings = await prisma.standing.findMany({
    where: { competitionId },
    orderBy: [
      { points: 'desc' },
      { goalDiff: 'desc' },
      { goalsFor: 'desc' }
    ]
  });

  for (let i = 0; i < standings.length; i++) {
    await prisma.standing.update({
      where: { id: standings[i].id },
      data: { position: i + 1 }
    });
  }
};

export const getStandings = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const standings = await prisma.standing.findMany({
      where: { competitionId },
      include: {
        team: true,
        competition: true
      },
      orderBy: { position: 'asc' }
    });

    res.json(standings);
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
};

export const getTopScorers = async (req, res) => {
  try {
    const { competitionId } = req.query;

    const goalEvents = await prisma.matchEvent.findMany({
      where: {
        type: 'GOAL',
        ...(competitionId && {
          match: {
            competitionId
          }
        })
      },
      include: {
        player: {
          include: {
            team: true
          }
        },
        match: {
          include: {
            competition: true
          }
        }
      }
    });

    // Group by player and count goals
    const scorers = goalEvents.reduce((acc, event) => {
      if (!event.player) return acc;
      
      const playerId = event.player.id;
      if (!acc[playerId]) {
        acc[playerId] = {
          player: event.player,
          goals: 0,
          matches: new Set()
        };
      }
      acc[playerId].goals++;
      acc[playerId].matches.add(event.match.id);
      return acc;
    }, {});

    const topScorers = Object.values(scorers)
      .map(scorer => ({
        ...scorer.player,
        goals: scorer.goals,
        matches: scorer.matches.size
      }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 20);

    res.json(topScorers);
  } catch (error) {
    console.error('Get top scorers error:', error);
    res.status(500).json({ error: 'Failed to fetch top scorers' });
  }
};

export const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      },
      orderBy: { scheduledAt: 'desc' }
    });

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};