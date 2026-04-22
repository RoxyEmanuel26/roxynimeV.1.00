import { MetadataRoute } from "next";
import { getOngoingAnimeList } from "@/lib/animbus";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    if (process.env.NODE_ENV === "development") return "http://localhost:3000";
    return "https://roxy.my.id";
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    const staticPages: MetadataRoute.Sitemap = [
        { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/ongoing`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ];

    try {
        // Ambil page 1 dulu untuk cek total pages
        const firstRes = await getOngoingAnimeList(1, "samehadaku");

        // Perbaikan: gunakan .pagination?.totalPages
        const actualTotalPages = firstRes.pagination?.totalPages || 1;

        // Batasi maksimal 3 halaman agar Vercel tidak timeout & tidak diblokir
        const MAX_PAGES_TO_FETCH = Math.min(actualTotalPages, 3);

        // Jika hanya ada 1 halaman, langsung gunakan data dari firstRes
        let data = firstRes.data || [];

        // Fetch sisa halaman (mulai dari halaman 2) jika ada
        if (MAX_PAGES_TO_FETCH > 1) {
            const remainingRes = await Promise.all(
                Array.from({ length: MAX_PAGES_TO_FETCH - 1 }, (_, i) =>
                    // i mulai dari 0, jadi i + 2 = halaman 2, dst.
                    getOngoingAnimeList(i + 2, "samehadaku")
                )
            );
            const remainingData = remainingRes.flatMap(res => res.data || []);
            data = [...data, ...remainingData];
        }

        const dynamicPages: MetadataRoute.Sitemap = data.map((anime: any) => ({
            url: `${baseUrl}/anime/${anime.id || anime.slug}`,
            lastModified: anime.updatedAt ? new Date(anime.updatedAt) : new Date(),
            changeFrequency: "daily" as const,
            priority: 0.7,
        }));

        return [...staticPages, ...dynamicPages];
    } catch (error) {
        console.error("[Sitemap] Error fetching dynamic pages:", error);
        return staticPages;
    }
}
