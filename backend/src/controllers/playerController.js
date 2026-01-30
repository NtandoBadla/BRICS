import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPlayer = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, photoUrl } = req.body;
    const managerId = req.user.id;

    // Get manager's team
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || manager.role !== 'TEAM_MANAGER' || !manager.teamId) {
      return res.status(403).json({ error: 'Only team managers can create players' });
    }

    const player = await prisma.athlete.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        teamId: manager.teamId,
        photoUrl
      },
      include: {
        team: true
      }
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
};

export const getTeamPlayers = async (req, res) => {
  try {
    const managerId = req.user.id;

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || !manager.teamId) {
      return res.status(403).json({ error: 'Manager not associated with a team' });
    }

    const players = await prisma.athlete.findMany({
      where: { teamId: manager.teamId },
      include: { team: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(players);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, photoUrl } = req.body;
    const managerId = req.user.id;

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || !manager.teamId) {
      return res.status(403).json({ error: 'Manager not associated with a team' });
    }

    // Verify player belongs to manager's team
    const existingPlayer = await prisma.athlete.findUnique({
      where: { id }
    });

    if (!existingPlayer || existingPlayer.teamId !== manager.teamId) {
      return res.status(404).json({ error: 'Player not found or not in your team' });
    }

    const player = await prisma.athlete.update({
      where: { id },
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        photoUrl
      },
      include: { team: true }
    });

    res.json(player);
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || !manager.teamId) {
      return res.status(403).json({ error: 'Manager not associated with a team' });
    }

    const existingPlayer = await prisma.athlete.findUnique({
      where: { id }
    });

    if (!existingPlayer || existingPlayer.teamId !== manager.teamId) {
      return res.status(404).json({ error: 'Player not found or not in your team' });
    }

    await prisma.athlete.delete({
      where: { id }
    });

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
};