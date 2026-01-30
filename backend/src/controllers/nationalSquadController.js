import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNationalSquad = async (req, res) => {
  try {
    const { name, description, athleteIds } = req.body;
    const userId = req.user.id;

    // Verify user is federation official
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'FEDERATION_OFFICIAL') {
      return res.status(403).json({ error: 'Only federation officials can create national squads' });
    }

    // Create squad with athletes
    const squad = await prisma.nationalSquad.create({
      data: {
        name,
        description,
        createdBy: userId,
        athletes: {
          connect: athleteIds.map(id => ({ id }))
        }
      },
      include: {
        athletes: {
          include: {
            team: true
          }
        },
        creator: true
      }
    });

    res.status(201).json(squad);
  } catch (error) {
    console.error('Create squad error:', error);
    res.status(500).json({ error: 'Failed to create national squad' });
  }
};

export const getNationalSquads = async (req, res) => {
  try {
    const squads = await prisma.nationalSquad.findMany({
      include: {
        athletes: {
          include: {
            team: true
          }
        },
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(squads);
  } catch (error) {
    console.error('Get squads error:', error);
    res.status(500).json({ error: 'Failed to fetch national squads' });
  }
};

export const updateNationalSquad = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, athleteIds } = req.body;

    const squad = await prisma.nationalSquad.update({
      where: { id },
      data: {
        name,
        description,
        athletes: {
          set: athleteIds.map(id => ({ id }))
        }
      },
      include: {
        athletes: {
          include: {
            team: true
          }
        }
      }
    });

    res.json(squad);
  } catch (error) {
    console.error('Update squad error:', error);
    res.status(500).json({ error: 'Failed to update national squad' });
  }
};

export const getAvailableAthletes = async (req, res) => {
  try {
    const athletes = await prisma.athlete.findMany({
      include: {
        team: true
      },
      orderBy: [
        { team: { name: 'asc' } },
        { firstName: 'asc' }
      ]
    });

    res.json(athletes);
  } catch (error) {
    console.error('Get athletes error:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
};