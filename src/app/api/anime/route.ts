import { NextRequest, NextResponse } from "next/server";
import {
    getOngoingAnimeList,
    getCompletedAnimeList,
    getMoviesList,
    getAnimeByGenre,
    Anime,
} from "@/lib/animbus";

// Helper timeout wrapper
async function fetchWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 3000
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

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
            animeList = genreRes.data || [];
            pagination = genreRes.pagination;

            // SMART FALLBACK: If a provider like Anoboy returns almost no results for a genre,
            // we automatically fetch from all other providers to enrich the user experience.
            if (animeList.length <= 2) {
                console.log(`[API] Genre '${genre}' returned too few results on '${source}'. Triggering global fallback for page ${page}...`);
                const ALL_PROVIDERS = ["otakudesu", "samehadaku", "donghua", "anoboy", "oploverz"];
                // FIXED: Hanya coba 2 provider alternatif teratas, dengan perlindungan timeout 3 detik per fetch
                const topProviders = ALL_PROVIDERS
                    .filter(p => p !== source)
                    .slice(0, 2); // ← maksimal 2, bukan 4

                let fallbackHasNextPage = false;

                const fallbackResults = await Promise.allSettled(
                    topProviders.map(async (provider) => {
                        try {
                            const res = await fetchWithTimeout(
                                getAnimeByGenre(genre, page, provider),
                                3000
                            );
                            if (res.pagination?.hasNextPage || (res.pagination?.totalPages && res.pagination.totalPages > page)) {
                                fallbackHasNextPage = true;
                            }
                            return res.data.map((a: any) => ({ ...a, _source: provider }));
                        } catch {
                            return [];
                        }
                    })
                );

                const seenTitles = new Set<string>();
                animeList.forEach(a => seenTitles.add(a.title?.toLowerCase().trim() || ""));

                fallbackResults.forEach((result) => {
                    if (result.status === "fulfilled" && Array.isArray(result.value)) {
                        result.value.forEach((anime: any) => {
                            const key = anime.title?.toLowerCase().trim();
                            if (key && !seenTitles.has(key)) {
                                seenTitles.add(key);
                                animeList.push(anime);
                            }
                        });
                    }
                });

                // Shuffle fallback results slightly for variety, but keep original source items at top
                const originalItems = animeList.filter((a: any) => !a._source);
                let fallbackItems = animeList.filter((a: any) => a._source);
                fallbackItems = fallbackItems.sort(() => 0.5 - Math.random());
                animeList = [...originalItems, ...fallbackItems];

                // Ensure pagination allows for next page if any fallback provider has more pages
                if (fallbackHasNextPage) {
                    if (!pagination) {
                        pagination = { currentPage: page, hasNextPage: true, hasPrevPage: page > 1, totalPages: page + 1 };
                    } else {
                        pagination.hasNextPage = true;
                        if (!pagination.totalPages || pagination.totalPages <= page) {
                            pagination.totalPages = page + 1;
                        }
                    }
                }
            }
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

        // Hitung totalPages secara aman
        const perPage = pagination?.items?.per_page || 20;
        const rawTotal = pagination?.totalPages
            || (pagination?.items?.total
                ? Math.ceil(pagination.items.total / perPage)
                : null)
            || pagination?.lastVisiblePage
            || null;

        // hasNext: percayai provider, atau fallback dari data length
        const rawHasNext = pagination?.hasNextPage
            ?? (rawTotal ? rawTotal > page : animeList.length >= perPage);

        // Normalisasi: pastikan UI tidak pernah "buntu"
        const safeHasNext = rawHasNext && animeList.length > 0;
        const safeTotalPages = Math.max(
            rawTotal || 1,
            page,
            safeHasNext ? page + 1 : 1
        );

        // FIXED: pastikan normalisasi pagination backend
        const data = {
            status: "success",
            data: animeList,
            total_item: pagination?.items?.total || animeList.length,
            hasNext: safeHasNext,
            hasPrev: pagination?.hasPrevPage ?? (page > 1),
            current_page: pagination?.currentPage || page,
            totalPages: safeTotalPages,
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
