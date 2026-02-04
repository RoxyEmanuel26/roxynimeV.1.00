import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch user's watch history
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ data: [] });
        }

        const history = await prisma.watchHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { watchedAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ data: history });
    } catch (error) {
        console.error("Error fetching watch history:", error);
        return NextResponse.json(
            { error: "Failed to fetch watch history" },
            { status: 500 }
        );
    }
}

// POST - Add/update watch history
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { animeId, episode, progress, title, image } = await request.json();

        if (!animeId || !episode) {
            return NextResponse.json(
                { error: "Anime ID and episode are required" },
                { status: 400 }
            );
        }

        const historyEntry = await prisma.watchHistory.upsert({
            where: {
                userId_animeId_episode: {
                    userId: session.user.id,
                    animeId: String(animeId),
                    episode: Number(episode),
                },
            },
            update: {
                progress: Number(progress) || 0,
                watchedAt: new Date(),
                title,
                image,
            },
            create: {
                userId: session.user.id,
                animeId: String(animeId),
                episode: Number(episode),
                progress: Number(progress) || 0,
                title: title || "",
                image: image || "",
            },
        });

        return NextResponse.json({ data: historyEntry });
    } catch (error) {
        console.error("Error updating watch history:", error);
        return NextResponse.json(
            { error: "Failed to update watch history" },
            { status: 500 }
        );
    }
}
