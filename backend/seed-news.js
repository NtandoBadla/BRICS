require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNews() {
  console.log('🌱 Seeding news articles...');

  try {
    // Check if we already have news
    const existingNews = await prisma.content.count({
      where: { type: 'NEWS' }
    });

    if (existingNews > 0) {
      console.log(`✅ Database already has ${existingNews} news articles`);
      return;
    }

    // Create some sample news articles
    const newsArticles = [
      {
        title: 'BRICS Football Championship 2024 Officially Launched',
        summary: 'The inaugural BRICS Football Championship brings together the best teams from Brazil, Russia, India, China, and South Africa in a historic tournament.',
        content: 'The BRICS nations have officially launched their first-ever football championship, marking a significant milestone in international sports cooperation. The tournament will feature national teams from all five BRICS countries competing for the inaugural title. This championship represents not just sporting excellence but also the strengthening of cultural and diplomatic ties between these emerging economies.',
        type: 'NEWS',
        status: 'PUBLISHED',
        language: 'en'
      },
      {
        title: 'State-of-the-Art Stadium Facilities Ready for Tournament',
        summary: 'New world-class stadium facilities have been completed across BRICS nations, featuring modern amenities and sustainable technology.',
        content: 'The BRICS Football Championship will be hosted in newly constructed and renovated stadiums that meet international standards. These facilities incorporate sustainable technology, enhanced security systems, and improved accessibility features. The stadiums are designed to provide an exceptional experience for players, officials, and spectators alike.',
        type: 'NEWS',
        status: 'PUBLISHED',
        language: 'en'
      },
      {
        title: 'Player Registration and Team Selection Process Begins',
        summary: 'National football federations from BRICS countries have opened the registration process for players and coaching staff.',
        content: 'The selection process for the BRICS Football Championship has officially begun, with each nation\'s football federation working to identify and register their best talent. The process includes comprehensive player evaluations, medical assessments, and strategic team formation. Coaches are focusing on building squads that represent the highest level of football excellence from their respective countries.',
        type: 'NEWS',
        status: 'PUBLISHED',
        language: 'en'
      },
      {
        title: 'International Referees Appointed for Championship',
        summary: 'A panel of experienced international referees has been selected to officiate matches in the BRICS Football Championship.',
        content: 'The BRICS Football Championship will feature top-tier officiating with referees selected from FIFA\'s international panel. These experienced officials bring expertise from major tournaments including World Cups, continental championships, and premier league competitions. The referee selection process emphasized fairness, experience, and cultural understanding to ensure the highest standards of match officiating.',
        type: 'NEWS',
        status: 'PUBLISHED',
        language: 'en'
      },
      {
        title: 'Broadcasting Rights and Global Coverage Announced',
        summary: 'The BRICS Football Championship will be broadcast globally, bringing the tournament to millions of football fans worldwide.',
        content: 'Major broadcasting networks have secured rights to televise the BRICS Football Championship, ensuring global coverage of this historic tournament. The championship will be available through traditional television broadcasts, streaming platforms, and digital media channels. This comprehensive coverage strategy aims to showcase the talent and passion of BRICS nations\' football to a worldwide audience.',
        type: 'NEWS',
        status: 'PUBLISHED',
        language: 'en'
      }
    ];

    // Create news articles
    for (const article of newsArticles) {
      await prisma.content.create({
        data: {
          ...article,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          updatedAt: new Date()
        }
      });
    }

    console.log(`✅ Successfully created ${newsArticles.length} news articles`);
    
    // Verify creation
    const totalNews = await prisma.content.count({
      where: { type: 'NEWS' }
    });
    console.log(`📰 Total news articles in database: ${totalNews}`);

  } catch (error) {
    console.error('❌ Error seeding news:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Some articles may already exist (duplicate constraint)');
    } else if (error.code === 'P2021') {
      console.log('💡 Database tables not found. Please run migrations first.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedNews();