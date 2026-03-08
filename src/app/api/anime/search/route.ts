import { NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/animbus";

const ALL_PROVIDERS = ["otakudesu", "samehadaku", "donghua", "anoboy", "oploverz"];

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const source = searchParams.get("source") || undefined;

    if (!query) {
        return NextResponse.json(
            { error: "Search query is required" },
            { status: 400 }
        );
    }

    try {
        // If source is "all" or not specified, search ALL providers
        if (!source || source === "all") {
            const providers = ["otakudesu", "samehadaku", "donghua", "anoboy", "oploverz"];
            const results = await Promise.allSettled(
                providers.map(p => searchAnimes(query, p).catch(() => ({ data: [] })))
            );

            // Merge and deduplicate
            const allAnimes: any[] = [];
            const seenTitles = new Set<string>();

            results.forEach((result) => {
                if (result.status === "fulfilled" && (result.value as any)?.data) {
                    ((result.value as any).data || []).forEach((anime: any) => {
                        const key = anime.title?.toLowerCase().trim();
                        if (key && !seenTitles.has(key)) {
                            seenTitles.add(key);
                            allAnimes.push(anime);
                        }
                    });
                }
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
        }

        // Single provider search
        const { data: animes, pagination } = await searchAnimes(query, source);

        const totalPages = pagination?.totalPages || (pagination?.items?.total
            ? Math.ceil(pagination.items.total / (pagination.items.per_page || 20))
            : (pagination?.lastVisiblePage || 1));

        const hasNext = pagination?.hasNextPage !== undefined
            ? pagination.hasNextPage
            : (totalPages > page && animes.length > 0);

        const data = {
            status: "success",
            data: animes,
            total_item: pagination?.items?.total || animes.length,
            hasNext: hasNext,
            hasPrev: pagination?.hasPrevPage ?? (page > 1),
            current_page: pagination?.currentPage || page,
            totalPages: totalPages,
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
