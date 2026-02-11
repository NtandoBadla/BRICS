const { PrismaClient } = require("@prisma/client");

// Use a global variable to store the Prisma Client instance
// This prevents multiple instances from being created during hot-reloading
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
