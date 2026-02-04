import { NextRequest, NextResponse } from "next/server";
import { getEpisodeStreams } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
    const [animeId, episodeId] = slug;

    console.log("🎯 [API /streaming] Request received");
    console.log("   Anime ID:", animeId);
    console.log("   Episode ID:", episodeId);

    if (!animeId || !episodeId) {
        console.error("❌ [API /streaming] Missing parameters");
        return NextResponse.json(
            { error: "Anime ID and episode ID are required" },
            { status: 400 }
        );
    }

    try {
        // Pass the episode ID/slug directly to the client wrapper
        const streamData = await getEpisodeStreams(episodeId);

        if (!streamData) {
            console.warn("⚠️ [API /streaming] No stream data returned");
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

        console.log("✨ [API /streaming] Mapped streams:", streams.length);

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

        console.log("✅ [API /streaming] Response ready:", {
            streamCount: streams.length,
            hasStreams: streams.length > 0
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("💥 [API /streaming] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch streaming data",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
