import { NextRequest, NextResponse } from "next/server";
import { getEpisodeStreams } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
    const [animeId, episodeId] = slug;

    if (!animeId || !episodeId) {
        return NextResponse.json(
            { error: "Anime ID and episode ID are required" },
            { status: 400 }
        );
    }

    try {
        // Construct episode path in animbus format: /anime/{animeId}/episode/{episodeId}
        const episodePath = `/anime/${animeId}/episode/${episodeId}`;
        const streamData = await getEpisodeStreams(episodePath);

        if (!streamData) {
            return NextResponse.json(
                { error: "Stream not found" },
                { status: 404 }
            );
        }

        // Convert to kazuna-api compatible format
        const data = {
            title: animeId,
            episode: episodeId,
            streams: streamData.url ? [
                {
                    quality: "default",
                    url: streamData.url,
                    type: "iframe"
                }
            ] : []
        };

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching streaming data:", error);
        return NextResponse.json(
            { error: "Failed to fetch streaming data" },
            { status: 500 }
        );
    }
}
