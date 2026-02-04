import { NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/animbus";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    if (!query) {
        return NextResponse.json(
            { error: "Search query is required" },
            { status: 400 }
        );
    }

    try {
        const animes = await searchAnimes(query);

        // Convert to match kazuna-api response format for compatibility
        const data = {
            status: "success",
            data: animes,
            total_item: animes.length,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error searching anime:", error);
        return NextResponse.json(
            { error: "Failed to search anime" },
            { status: 500 }
        );
    }
}
