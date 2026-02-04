import { NextRequest, NextResponse } from "next/server";
import { getAnimeInfo } from "@/lib/animbus";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const data = await getAnimeInfo(id);

        if (!data) {
            return NextResponse.json(
                { error: "Anime not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching anime details:", error);
        return NextResponse.json(
            { error: "Failed to fetch anime details" },
            { status: 500 }
        );
    }
}
