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
        // Get streaming data from animbus wrapper
        const streamData = await getEpisodeStreams(episodeId);

        if (!streamData) {
            console.warn("⚠️ [API /streaming] No stream data returned");
            return NextResponse.json(
                { error: "Stream not found" },
                { status: 404 }
            );
        }

        console.log("📦 [API /streaming] Stream data received:", {
            hasUrl: !!streamData.url,
            serverCount: streamData.servers?.length || 0
        });

        // Convert to UI compatible format - INCLUDE NAME FIELD
        const streams = streamData.servers?.map((server, index) => {
            console.log(`   Mapping server ${index + 1}:`, {
                name: server.name,
                quality: server.quality,
                hasUrl: !!server.streamUrl
            });

            return {
                name: server.name,           // 👈 SERVER NAME (vidhide, filedon, mega, etc)
                quality: server.quality,      // 👈 QUALITY (360p, 480p, 720p)
                url: server.streamUrl,        // 👈 STREAM URL
                type: "iframe"                // Type of player
            };
        }) || [];

        console.log("✨ [API /streaming] Mapped streams:", streams.length);

        // Fallback if no servers but direct url exists
        if (streams.length === 0 && streamData.url) {
            console.log("⚠️ [API /streaming] Using fallback direct URL");
            streams.push({
                name: "default",
                quality: "auto",
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
            hasStreams: streams.length > 0,
            sampleStream: streams[0] ? {
                name: streams[0].name,
                quality: streams[0].quality
            } : null
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
