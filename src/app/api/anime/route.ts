import { NextRequest, NextResponse } from "next/server";
import {
    getOngoingAnimeList,
    getCompletedAnimeList,
    getMoviesList,
} from "@/lib/animbus";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "ongoing";
    const page = parseInt(searchParams.get("page") || "1");

    try {
        let data;

        let animeList;

        switch (type) {
            case "completed":
                animeList = await getCompletedAnimeList(page);
                break;
            case "movie":
                animeList = await getMoviesList(page);
                break;
            case "ongoing":
            default:
                animeList = await getOngoingAnimeList(page);
                break;
        }

        // Convert to match kazuna-api response format for compatibility
        data = {
            status: "success",
            data: animeList,
            total_item: animeList.length,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching anime:", error);
        return NextResponse.json(
            { error: "Failed to fetch anime" },
            { status: 500 }
        );
    }
}
