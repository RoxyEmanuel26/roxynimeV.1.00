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
        // Pass the episode ID/slug directly to the Sanka client wrapper
        const streamData = await getEpisodeStreams(episodeId);

        if (!streamData) {
            return NextResponse.json(
                { error: "Stream not found" },
                { status: 404 }
            );
        }

        // Convert to UI compatible format
        const streams = streamData.servers?.map(server => ({
            quality: server.quality || server.name, // Use quality if available, else name
            url: server.streamUrl,
            type: "iframe" // Most sanka streams are iframes
        })) || [];

        // Fallback if no servers but direct url exists
        if (streams.length === 0 && streamData.url) {
            streams.push({
                quality: "default",
                url: streamData.url,
                type: "iframe"
            });
        }

        const data = {
            title: animeId,
            episode: episodeId,
            streams: streams
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
