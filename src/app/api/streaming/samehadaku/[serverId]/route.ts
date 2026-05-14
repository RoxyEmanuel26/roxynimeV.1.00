import { NextRequest, NextResponse } from "next/server";

const SANKA_API_BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serverId: string }> }
) {
    const { serverId } = await params;

    if (!serverId) {
        return NextResponse.json(
            { error: "Server ID is required" },
            { status: 400 }
        );
    }

    try {
        const url = `${SANKA_API_BASE}/anime/samehadaku/server/${serverId}`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Server not found" },
                { status: 404 }
            );
        }

        const data = await res.json();

        // Extract video URL from response
        const videoUrl = data.data?.url || data.url || null;

        if (!videoUrl) {
            return NextResponse.json(
                { error: "No video URL found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { url: videoUrl },
            url: videoUrl,
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
                "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
                "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=3600",
            },
        });
    } catch (error) {
        console.error("[API /streaming/samehadaku] Error:", error);
        return NextResponse.json(
            { error: "Failed to resolve server URL" },
            { status: 500 }
        );
    }
}
