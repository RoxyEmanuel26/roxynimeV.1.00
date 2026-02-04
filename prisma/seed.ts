import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 12);
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@roxynime.com" },
        update: {},
        create: {
            email: "demo@roxynime.com",
            name: "Demo User",
            password: hashedPassword,
        },
    });

    console.log("✅ Created demo user:", demoUser.email);

    // Create some sample watch history
    const sampleHistory = [
        {
            animeId: "2894",
            title: "Oshi no Ko 2nd Season",
            image: "https://cdn.myanimelist.net/images/anime/1006/143302l.jpg",
            episode: 1,
            progress: 45.5,
        },
        {
            animeId: "2900",
            title: "Ramen Akaneko",
            image: "https://cdn.myanimelist.net/images/anime/1805/142211l.jpg",
            episode: 3,
            progress: 100,
        },
    ];

    for (const item of sampleHistory) {
        await prisma.watchHistory.upsert({
            where: {
                userId_animeId_episode: {
                    userId: demoUser.id,
                    animeId: item.animeId,
                    episode: item.episode,
                },
            },
            update: {},
            create: {
                userId: demoUser.id,
                ...item,
            },
        });
    }

    console.log("✅ Created sample watch history");

    // Create some sample favorites
    const sampleFavorites = [
        {
            animeId: "2894",
            title: "Oshi no Ko 2nd Season",
            image: "https://cdn.myanimelist.net/images/anime/1006/143302l.jpg",
        },
        {
            animeId: "2919",
            title: "Shikanoko Nokonoko Koshitantan",
            image: "https://cdn.myanimelist.net/images/anime/1094/143324l.jpg",
        },
    ];

    for (const item of sampleFavorites) {
        await prisma.favorite.upsert({
            where: {
                userId_animeId: {
                    userId: demoUser.id,
                    animeId: item.animeId,
                },
            },
            update: {},
            create: {
                userId: demoUser.id,
                ...item,
            },
        });
    }

    console.log("✅ Created sample favorites");
    console.log("🎉 Database seed completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
