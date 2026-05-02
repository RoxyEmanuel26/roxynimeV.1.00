const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.apiCache.deleteMany({ where: { key: { startsWith: 'oploverz_' } } });
  console.log('Cleared oploverz cache');
  await prisma.$disconnect();
}
run();
