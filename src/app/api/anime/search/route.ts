import { NextRequest, NextResponse } from "next/server";
import { searchAnimes } from "@/lib/animbus";

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
        const { data: animes, pagination } = await searchAnimes(query, source);

        const totalPages = pagination?.totalPages || (pagination?.items?.total
            ? Math.ceil(pagination.items.total / (pagination.items.per_page || 20))
            : (pagination?.lastVisiblePage || 1));

        const data = {
            status: "success",
            data: animes,
            total_item: pagination?.items?.total || animes.length,
            hasNext: pagination?.hasNextPage ?? false,
            hasPrev: pagination?.hasPrevPage ?? false,
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
