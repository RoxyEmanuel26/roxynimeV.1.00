import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch user's favorites
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ data: [] });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ data: favorites });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { animeId, title, image, malId } = await request.json();

        if (!animeId) {
            return NextResponse.json(
                { error: "Anime ID is required" },
                { status: 400 }
            );
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_animeId: {
                    userId: session.user.id,
                    animeId: String(animeId),
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Already in favorites" },
                { status: 400 }
            );
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: session.user.id,
                animeId: String(animeId),
                title: title || "",
                image: image || "",
                malId: malId || null,
            },
        });

        return NextResponse.json({ data: favorite });
    } catch (error) {
        console.error("Error adding to favorites:", error);
        return NextResponse.json(
            { error: "Failed to add to favorites" },
            { status: 500 }
        );
    }
}
