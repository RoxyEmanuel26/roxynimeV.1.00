import { NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/animbus";

const ALL_PROVIDERS = ["otakudesu", "samehadaku", "donghua", "oploverz", "kuramanime"];

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

    const source = searchParams.get("source");

    if (!query) {
        return NextResponse.json(
            { error: "Search query is required" },
            { status: 400 }
        );
    }

    try {
        let allAnimes: any[] = [];
        
        if (source && source !== "all" && ALL_PROVIDERS.includes(source)) {
            const res = await fetchWithTimeout(searchAnimes(query, source), 8000).catch(() => ({ data: [] }));
            allAnimes = ((res as any).data || []).map((a: any) => ({ ...a, _source: source }));
        } else {
            const results = await Promise.allSettled(
                ALL_PROVIDERS.map(p => 
                    fetchWithTimeout(searchAnimes(query, p), 8000)
                        .catch(() => ({ data: [] }))
                )
            );

            // Merge and deduplicate
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

            // No sorting needed anymore
        }

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
        }, {
            headers: {
                "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error searching anime:", error);
        return NextResponse.json(
            { error: "Failed to search anime" },
            { status: 500 }
        );
    }
}
