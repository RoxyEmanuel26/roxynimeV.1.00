import { NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/animbus";

const ALL_PROVIDERS = ["anoboy", "otakudesu", "samehadaku", "donghua", "oploverz"];

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
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    if (!query) {
        return NextResponse.json(
            { error: "Search query is required" },
            { status: 400 }
        );
    }

    try {
        const results = await Promise.allSettled(
            ALL_PROVIDERS.map(p => 
                fetchWithTimeout(searchAnimes(query, p), 3000)
                    .catch(() => ({ data: [] }))
            )
        );

        // Merge and deduplicate
        const allAnimes: any[] = [];
        const seenTitles = new Set<string>();
        const seenSlugs = new Set<string>();

        results.forEach((result, i) => {
            const provider = ALL_PROVIDERS[i];
            if (result.status === "fulfilled" && (result.value as any)?.data) {
                ((result.value as any).data || []).forEach((anime: any) => {
                    const titleKey = anime.title?.toLowerCase().trim() || "";
                    const slugKey = anime.slug || anime.id || "";
                    
                    if (!titleKey && !slugKey) return;

                    const isTitleDuplicate = titleKey && seenTitles.has(titleKey);
                    const isSlugDuplicate = slugKey && seenSlugs.has(slugKey);

                    if (!isTitleDuplicate && !isSlugDuplicate) {
                        if (titleKey) seenTitles.add(titleKey);
                        if (slugKey) seenSlugs.add(slugKey);
                        allAnimes.push({ ...anime, _source: provider });
                    }
                });
            }
        });

        // Prioritize anoboy
        allAnimes.sort((a: any, b: any) => {
            if (a._source === "anoboy" && b._source !== "anoboy") return -1;
            if (a._source !== "anoboy" && b._source === "anoboy") return 1;
            return 0;
        });

        // Pagination untuk search hasil gabungan
        const perPage = 20;
        const start = (page - 1) * perPage;
        const paged = allAnimes.slice(start, start + perPage);

        return NextResponse.json({
            status: "success",
            data: paged,
            total_item: allAnimes.length,
            hasNext: allAnimes.length > start + perPage,
            hasPrev: page > 1,
            current_page: page,
            totalPages: Math.max(1, Math.ceil(allAnimes.length / perPage)),
        });
    } catch (error) {
        console.error("Error searching anime:", error);
        return NextResponse.json(
            { error: "Failed to search anime" },
            { status: 500 }
        );
    }
}
