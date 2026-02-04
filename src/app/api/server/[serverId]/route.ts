import { NextRequest, NextResponse } from "next/server";

const SANKA_API_BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    const { serverId } = await params;

    console.log("🎬 [API /server] Resolving server URL:", serverId);

    if (!serverId) {
        return NextResponse.json(
            { error: "Server ID is required" },
            { status: 400 }
        );
    }

    try {
        const url = `${SANKA_API_BASE}/anime/server/${serverId}`;
        console.log("📞 [API /server] Fetching from:", url);

        const res = await fetch(url);

        if (!res.ok) {
            console.error("❌ [API /server] Failed:", res.status);
            return NextResponse.json(
                { error: "Server not found" },
                { status: 404 }
            );
        }

        const data = await res.json();
        console.log("📦 [API /server] Response:", data);

        // Extract video URL from response
        const videoUrl = data.data?.url || data.url || null;

        if (!videoUrl) {
            console.error("❌ [API /server] No video URL in response");
            return NextResponse.json(
                { error: "No video URL found" },
                { status: 404 }
            );
        }

        console.log("✅ [API /server] Video URL resolved:", videoUrl);

        return NextResponse.json({
            success: true,
            url: videoUrl
        });
    } catch (error) {
        console.error("💥 [API /server] Error:", error);
        return NextResponse.json(
            { error: "Failed to resolve server URL" },
            { status: 500 }
        );
    }
}
