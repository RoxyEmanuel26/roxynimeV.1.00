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

const ALL_PROVIDERS = ["otakudesu", "samehadaku", "donghua", "oploverz", "kuramanime"];

async function fetchFromAll(fetcher: (provider: string) => Promise<any>, page: number, type?: string) {
    const results = await Promise.allSettled(
        ALL_PROVIDERS.map(async (provider) => {
            try {
                const res = await fetchWithTimeout(fetcher(provider), 8000);
                return { provider, data: res.data || [], pagination: res.pagination };
            } catch {
                return { provider, data: [], pagination: null };
            }
        })
    );

    const allAnimes: Anime[] = [];
    const seenTitles = new Set<string>();
    const seenSlugs = new Set<string>();

    let maxTotalPages = page;
    let anyHasNext = false;
    let totalItems = 0;

    results.forEach((result) => {
        if (result.status === "fulfilled") {
            const { provider, data, pagination } = result.value;

            // Calculate pagination
            if (pagination) {
                if (pagination.hasNextPage) anyHasNext = true;
                const tp = pagination.totalPages || (pagination.items?.total ? Math.ceil(pagination.items.total / (pagination.items.per_page || 20)) : 1);
                if (tp > maxTotalPages) maxTotalPages = tp;
                totalItems += pagination.items?.total || data.length;
            } else if (data.length > 0) {
                totalItems += data.length;
            }

            // Deduplicate + server-side filter
            data.forEach((anime: any) => {
                const titleKey = anime.title?.toLowerCase().trim();
                const slugKey = anime.slug || anime.id || "";

                // Strip completed anime from ongoing requests
                if (type === "ongoing" && titleKey) {
                    const status = String(anime.status || "").toLowerCase();
                    if (status.includes("completed") || status.includes("finished") || status.includes("tamat")) return;
                    if (titleKey.includes("batch") || titleKey.includes("[end]") || titleKey.includes("(end)")) return;
                    if (titleKey.includes("complete subtitle") || titleKey.includes("lengkap subtitle")) return;
                    const ep = String(anime.episode || "").toLowerCase();
                    if (ep.includes("[end]") || ep.includes("batch") || ep === "end") return;
                }

                if (titleKey && !seenTitles.has(titleKey) && (!slugKey || !seenSlugs.has(slugKey))) {
                    seenTitles.add(titleKey);
                    if (slugKey) seenSlugs.add(slugKey);
                    allAnimes.push({ ...anime, _source: provider });
                }
            });
        }
    });

    // No sorting needed anymore

    return {
        data: allAnimes,
        pagination: {
            currentPage: page,
            hasNextPage: anyHasNext,
            hasPrevPage: page > 1,
            totalPages: maxTotalPages,
            items: { count: allAnimes.length, total: totalItems, per_page: 20 }
        }
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "completed";
    const genre = searchParams.get("genre");
    const page = parseInt(searchParams.get("page") || "1");
    const source = searchParams.get("source");

    try {
        let fetcher: (provider: string) => Promise<any>;

        if (genre) {
            fetcher = (provider) => getAnimeByGenre(genre, page, provider);
        } else {
            switch (type) {
                case "completed":
                    fetcher = (provider) => getCompletedAnimeList(page, provider);
                    break;
                case "movie":
                    fetcher = (provider) => getMoviesList(page, provider);
                    break;
                case "ongoing":
                default:
                    fetcher = (provider) => getOngoingAnimeList(page, provider);
                    break;
            }
        }

        let animeList: Anime[] = [];
        let pagination: any;

        if (source && source !== "all" && ALL_PROVIDERS.includes(source)) {
            const res = await fetchWithTimeout(fetcher(source), 8000);
            let filteredData = res.data || [];
            
            if (type === "ongoing") {
                filteredData = filteredData.filter((anime: any) => {
                    const titleKey = String(anime.title || "").toLowerCase().trim();
                    const status = String(anime.status || "").toLowerCase();
                    if (status.includes("completed") || status.includes("finished") || status.includes("tamat")) return false;
                    if (titleKey.includes("batch") || titleKey.includes("[end]") || titleKey.includes("(end)")) return false;
                    if (titleKey.includes("complete subtitle") || titleKey.includes("lengkap subtitle")) return false;
                    const ep = String(anime.episode || "").toLowerCase();
                    if (ep.includes("[end]") || ep.includes("batch") || ep === "end") return false;
                    return true;
                });
            }

            animeList = filteredData.map((a: any) => ({ ...a, _source: source }));
            pagination = res.pagination || {
                currentPage: page,
                hasNextPage: false,
                hasPrevPage: page > 1,
            };
        } else {
            const result = await fetchFromAll(fetcher, page, type);
            animeList = result.data;
            pagination = result.pagination;
        }

        const safeHasNext = pagination.hasNextPage && animeList.length > 0;
        const safeTotalPages = Math.max(pagination.totalPages || 1, page, safeHasNext ? page + 1 : 1);

        const data = {
            status: "success",
            data: animeList,
            total_item: pagination.items?.total || animeList.length,
            hasNext: safeHasNext,
            hasPrev: pagination.hasPrevPage ?? (page > 1),
            current_page: page,
            totalPages: safeTotalPages,
        };

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error fetching anime:", error);
        return NextResponse.json(
            { error: "Failed to fetch anime" },
            { status: 500 }
        );
    }
}
