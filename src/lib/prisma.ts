import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

// Simpan singleton di globalThis untuk SEMUA environment (termasuk production)
// agar build workers dan serverless functions tidak membuat koneksi baru tiap kali
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export default prisma;
