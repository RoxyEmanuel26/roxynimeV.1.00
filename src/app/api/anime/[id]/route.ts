import { NextRequest, NextResponse } from "next/server";
import { getAnimeInfo } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const source = request.nextUrl.searchParams.get("source") || undefined;

    console.log(`🎯 [API /anime] Request for anime: ${id}, source: ${source || "default"}`);

    if (!id) {
        return NextResponse.json(
            { error: "Anime ID is required" },
            { status: 400 }
        );
    }

    try {
        const animeData = await getAnimeInfo(id, source);

        console.log("✅ [API /anime] Data fetched:", {
            title: animeData.title,
            episodeCount: animeData.episodes?.length || 0
        });

        return NextResponse.json({
            success: true,
            data: animeData
        });
    } catch (error) {
        console.error("💥 [API /anime] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch anime details",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
