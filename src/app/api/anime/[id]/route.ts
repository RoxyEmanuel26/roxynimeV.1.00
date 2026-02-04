import { NextRequest, NextResponse } from "next/server";
import { getAnimeInfo } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    console.log("🎯 [API /anime] Request for anime:", id);

    if (!id) {
        return NextResponse.json(
            { error: "Anime ID is required" },
            { status: 400 }
        );
    }

    try {
        const animeData = await getAnimeInfo(id);

        console.log("✅ [API /anime] Data fetched:", {
            title: animeData.title,
            episodeCount: animeData.episodes?.length || 0
        });

        // Log first few episodes for debugging
        if (animeData.episodes && animeData.episodes.length > 0) {
            console.log("📺 [API /anime] Sample episodes:");
            animeData.episodes.slice(0, 3).forEach((ep, idx) => {
                console.log(`   Ep ${idx + 1}:`, {
                    number: ep.number,
                    slug: ep.urlSlug,
                    title: ep.title
                });
            });
        }

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
