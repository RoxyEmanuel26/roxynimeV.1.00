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
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
                "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
                "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        // [SECURITY FIX] Jangan log raw error object
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("💥 [API /anime] Error:", errMsg);
        return NextResponse.json(
            {
                error: "Failed to fetch anime details",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
