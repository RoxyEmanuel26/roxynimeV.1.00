/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime for DB access (Prisma)
export const runtime = "nodejs";

// Revalidate cache every 5 minutes on Vercel
export const revalidate = 300;
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
    timeoutMs = 8000
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

// Provider mapping: otakudesu for everything, samehadaku for movies only
const ALL_PROVIDERS = ["otakudesu", "samehadaku"];

// Determine which providers actually support the requested feature
function getActiveProviders(type?: string): string[] {
    switch (type) {
        case "movie": return ["samehadaku"]; // Movies only from samehadaku
        default:      return ["otakudesu"];   // Everything else from otakudesu
    }
}

// Fetch from a specific provider and normalize to exactly 30 items per page
async function fetchProviderWithNormalization(
    provider: string, 
    requestedPage: number, 
    fetcher: (provider: string, p: number) => Promise<any>, 
    type?: string
) {
    const itemsPerPage = provider === "otakudesu" ? 25 : 30;
    const startIndex = (requestedPage - 1) * 30;
    const endIndex = requestedPage * 30;

    const startProviderPage = Math.floor(startIndex / itemsPerPage) + 1;
    const endProviderPage = Math.floor((endIndex - 1) / itemsPerPage) + 1;

    let allData: any[] = [];
    let anyHasNext = false;
    let maxTotalPages = 1;
    let totalItemsAcc = 0;

    for (let p = startProviderPage; p <= endProviderPage; p++) {
        try {
            const res = await fetchWithTimeout(fetcher(provider, p), 8000);
            if (res && res.data && res.data.length > 0) {
                allData = allData.concat(res.data);
                if (res.pagination) {
                    if (res.pagination.hasNextPage) anyHasNext = true;
                    if (res.pagination.totalPages > maxTotalPages) maxTotalPages = res.pagination.totalPages;
                    if (res.pagination.items?.total) totalItemsAcc = res.pagination.items.total;
                }
            } else {
                break;
            }
        } catch {
            break;
        }
    }

    const startSlice = startIndex % itemsPerPage;
    let slicedData = allData.slice(startSlice, startSlice + 30);

    if (type === "ongoing") {
        slicedData = slicedData.filter((anime: any) => {
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

    const mappedData = slicedData.map((a: any) => ({ ...a, _source: provider }));
    
    // Safely determine hasNextPage
    const hasMoreInArray = allData.length > startSlice + 30;
    const safeHasNext = hasMoreInArray || anyHasNext;

    return {
        data: mappedData,
        pagination: {
            currentPage: requestedPage,
            hasNextPage: safeHasNext && mappedData.length > 0,
            hasPrevPage: requestedPage > 1,
            totalPages: Math.ceil(totalItemsAcc / 30) || requestedPage + (safeHasNext ? 1 : 0),
            items: { count: mappedData.length, total: totalItemsAcc, per_page: 30 }
        }
    };
}

async function fetchFromAll(fetcher: (provider: string, p: number) => Promise<any>, page: number, type?: string) {
    const activeProviders = getActiveProviders(type);
    if (activeProviders.length === 0) {
        return { data: [], pagination: { currentPage: page, hasNextPage: false, hasPrevPage: page > 1, totalPages: 1, items: { count: 0, total: 0, per_page: 30 } } };
    }

    // To get 30 items total, we can just fetch the normalized page for each provider
    // and take the first 30 items. But this skips items for next pages.
    // However, properly paginating merged sets is very complex.
    // For now, we fetch the normalized page from each, merge them, and slice 30.
    // To minimize skipped items, we can try to fetch just page 1 from all if page=1, etc.
    const results = await Promise.allSettled(
        activeProviders.map(async (provider) => {
            return await fetchProviderWithNormalization(provider, page, fetcher, type);
        })
    );

    const allAnimes: Anime[] = [];
    const seenTitles = new Set<string>();
    const seenSlugs = new Set<string>();

    let maxTotalPages = page;
    let anyHasNext = false;
    let totalItems = 0;

    // Collect evenly from providers to make a good mix, up to 30 items
    const validResults = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map(r => r.value);
    
    validResults.forEach(res => {
        if (res.pagination) {
            if (res.pagination.hasNextPage) anyHasNext = true;
            if (res.pagination.totalPages > maxTotalPages) maxTotalPages = res.pagination.totalPages;
            totalItems += res.pagination.items?.total || res.data.length;
        }
    });

    let index = 0;
    let added = 0;
    const TARGET = 30;
    let exhausted = false;

    while (added < TARGET && !exhausted) {
        exhausted = true;
        for (const res of validResults) {
            if (index < res.data.length) {
                exhausted = false;
                const anime = res.data[index];
                const titleKey = anime.title?.toLowerCase().trim();
                const slugKey = anime.slug || anime.id || "";

                if (titleKey && !seenTitles.has(titleKey) && (!slugKey || !seenSlugs.has(slugKey))) {
                    seenTitles.add(titleKey);
                    if (slugKey) seenSlugs.add(slugKey);
                    allAnimes.push(anime);
                    added++;
                    if (added >= TARGET) break;
                }
            }
        }
        index++;
    }

    return {
        data: allAnimes,
        pagination: {
            currentPage: page,
            hasNextPage: anyHasNext,
            hasPrevPage: page > 1,
            totalPages: maxTotalPages,
            items: { count: allAnimes.length, total: totalItems, per_page: 30 }
        }
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "";
    const genre = searchParams.get("genre");
    const page = parseInt(searchParams.get("page") || "1");
    const source = searchParams.get("source");

    try {
        let fetcher: (provider: string, p: number) => Promise<any>;

        if (genre) {
            fetcher = (provider, p) => getAnimeByGenre(genre, p, provider);
        } else {
            switch (type) {
                case "completed":
                    fetcher = (provider, p) => getCompletedAnimeList(p, provider);
                    break;
                case "movie":
                    fetcher = (provider, p) => getMoviesList(p, provider);
                    break;
                case "ongoing":
                default:
                    fetcher = (provider, p) => getOngoingAnimeList(p, provider);
                    break;
            }
        }

        let animeList: Anime[] = [];
        let pagination: any;

        if (source && source !== "all" && ALL_PROVIDERS.includes(source)) {
            const result = await fetchProviderWithNormalization(source, page, fetcher, type);
            animeList = result.data;
            pagination = result.pagination;
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
                // Vercel CDN: fresh for 5 min, serve stale for 24h while revalidating
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
                // Vercel-specific: enable CDN caching
                "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
                "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        // [SECURITY FIX] Jangan log raw error object
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error fetching anime:", errMsg);
        return NextResponse.json(
            { error: "Failed to fetch anime" },
            { status: 500 }
        );
    }
}
