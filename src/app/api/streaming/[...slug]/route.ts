import { NextRequest, NextResponse } from "next/server";
import { getEpisodeStreams } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
    const [animeId, episodeId] = slug;
    const source = request.nextUrl.searchParams.get("source") || undefined;

    console.log(`🎯 [API /streaming] Request — anime: ${animeId}, episode: ${episodeId}, source: ${source || "default"}`);

    if (!animeId || !episodeId) {
        return NextResponse.json(
            { error: "Anime ID and episode ID are required" },
            { status: 400 }
        );
    }

    try {
        const streamData = await getEpisodeStreams(episodeId, source);

        if (!streamData) {
            return NextResponse.json(
                { error: "Stream not found" },
                { status: 404 }
            );
        }

        // Convert to UI compatible format
        const streams = streamData.servers?.map((server) => ({
            name: server.name,
            quality: server.quality,
            url: server.streamUrl,
            type: "iframe",
        })) || [];

        // Fallback if no servers but direct url exists
        if (streams.length === 0 && streamData.url) {
            streams.push({
                name: "default",
                quality: "auto",
                url: streamData.url,
                type: "iframe",
            });
        }

        const data = {
            title: animeId,
            episode: episodeId,
            streams,
        };

        return NextResponse.json({ data });
    } catch (error) {
        console.error("💥 [API /streaming] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch streaming data",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
