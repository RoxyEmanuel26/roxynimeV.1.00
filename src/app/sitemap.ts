import { MetadataRoute } from "next";

// Helper to get base url
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: "https://roxy.my.id",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0
        },
        {
            url: "https://roxy.my.id/browse",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9
        },
        {
            url: "https://roxy.my.id/ongoing",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9
        },
        {
            url: "https://roxy.my.id/movies",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8
        },
    ];

    try {
        // Dynamic: fetch ongoing anime list untuk sitemap
        // Gunakan internal fetch ke /api/anime
        const res = await fetch(`${baseUrl}/api/anime?type=ongoing&source=samehadaku&page=1`, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return staticPages;
        }

        const json = await res.json();
        const data = json.data || [];

        // Ambil anime titles untuk sitemap
        const dynamicPages: MetadataRoute.Sitemap = data.map((anime: { slug: string; id: string }) => ({
            url: `https://roxy.my.id/anime/${anime.id || anime.slug}`,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 0.7,
        }));

        return [...staticPages, ...dynamicPages];
    } catch (error) {
        console.error("[Sitemap] Error fetching dynamic pages:", error);
        return staticPages;
    }
}
