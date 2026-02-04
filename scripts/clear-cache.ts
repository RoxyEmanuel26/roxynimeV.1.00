import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearCache() {
    try {
        const result = await prisma.apiCache.deleteMany({});
        console.log(`✅ Cleared ${result.count} cache entries`);
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearCache();
