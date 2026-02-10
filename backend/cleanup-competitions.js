const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up old competitions...');

  // Delete competitions that don't have a creator (old mock data)
  const deleted = await prisma.competition.deleteMany({
    where: {
      OR: [
        { createdBy: null },
        { name: { in: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA Champions League', 'UEFA Europa League', 'World Cup', 'Euro Championship', 'Primeira Liga'] } }
      ]
    }
  });

  console.log(`✅ Deleted ${deleted.count} old competitions`);

  // Show remaining competitions
  const remaining = await prisma.competition.findMany({
    include: {
      creator: {
        select: { firstName: true, lastName: true, role: true }
      }
    }
  });

  console.log(`\n📊 Remaining competitions: ${remaining.length}`);
  remaining.forEach(comp => {
    console.log(`  - ${comp.name} (Created by: ${comp.creator?.firstName || 'Unknown'})`);
  });
}

cleanup()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
