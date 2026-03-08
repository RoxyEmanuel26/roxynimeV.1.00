import { NextRequest, NextResponse } from "next/server";
import {
    getOngoingAnimeList,
    getCompletedAnimeList,
    getMoviesList,
    getAnimeByGenre,
    Anime,
} from "@/lib/animbus";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "completed";
    const genre = searchParams.get("genre");
    const page = parseInt(searchParams.get("page") || "1");
    const source = searchParams.get("source") || undefined;

    try {
        let animeList: Anime[] = [];
        let pagination;

        // If genre is specified, use genre endpoint
        if (genre) {
            console.log(`[API] Fetching by genre: ${genre}, page: ${page}, source: ${source || "default"}`);
            const genreRes = await getAnimeByGenre(genre, page, source);
            animeList = genreRes.data;
            pagination = genreRes.pagination;
        } else {
            // Otherwise use type-based endpoints
            switch (type) {
                case "completed":
                    const completedRes = await getCompletedAnimeList(page, source);
                    animeList = completedRes.data;
                    pagination = completedRes.pagination;
                    break;
                case "movie":
                    const movieRes = await getMoviesList(page, source);
                    animeList = movieRes.data;
                    pagination = movieRes.pagination;
                    break;
                case "ongoing":
                default:
                    const ongoingRes = await getOngoingAnimeList(page, source);
                    animeList = ongoingRes.data;
                    pagination = ongoingRes.pagination;
                    break;
            }
        }

        // Handle case when animeList is undefined
        if (!animeList) {
            animeList = [];
        }

        const totalPages = pagination?.totalPages || (pagination?.items?.total
            ? Math.ceil(pagination.items.total / (pagination.items.per_page || 20))
            : (pagination?.lastVisiblePage || 1));

        // Convert to match frontend response format
        const data = {
            status: "success",
            data: animeList,
            total_item: pagination?.items?.total || animeList.length,
            hasNext: pagination?.hasNextPage ?? false,
            hasPrev: pagination?.hasPrevPage ?? false,
            current_page: pagination?.currentPage || page,
            totalPages: totalPages,
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
