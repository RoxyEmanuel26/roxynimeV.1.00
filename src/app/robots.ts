import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // ── Default rules untuk semua crawler ────────────────────
                userAgent: "*",
                allow: [
                    "/",
                    "/browse",
                    "/ongoing",
                    "/movies",
                    "/anime/",
                    "/watch/",
                    "/schedule",
                    "/contact",
                    "/privacy",
                    "/terms",
                    "/dmca",
                ],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                    "/_next/",
                    "/favicon.ico",
                    "/*.json$",
                ],
            },
            {
                // ── Google: paling permissif agar bisa crawl semua ───────
                userAgent: "Googlebot",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── Google Image bot: izinkan poster anime di-index ──────
                userAgent: "Googlebot-Image",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── Bing ─────────────────────────────────────────────────
                userAgent: "Bingbot",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── Yandex ───────────────────────────────────────────────
                userAgent: "Yandex",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── DuckDuckGo ───────────────────────────────────────────
                userAgent: "DuckDuckBot",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── Baidu (untuk traffic Asia) ───────────────────────────
                userAgent: "Baiduspider",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // ── Pinterest (untuk sharing) ────────────────────────────
                userAgent: "Pinterest",
                allow: ["/"],
            },
            {
                // ── Social media crawlers ────────────────────────────────
                userAgent: ["facebookexternalhit", "Twitterbot", "LinkedInBot", "WhatsApp"],
                allow: ["/"],
            },
            {
                // ── Block AI training bots yang mengambil konten ─────────
                userAgent: [
                    "GPTBot",
                    "ChatGPT-User",
                    "Google-Extended",
                    "CCBot",
                    "anthropic-ai",
                    "Claude-Web",
                    "Bytespider",
                    "Amazonbot",
                    "FacebookBot",
                    "Applebot-Extended",
                    "PerplexityBot",
                    "YouBot",
                    "Diffbot",
                ],
                disallow: ["/"],
            },
            {
                // ── Block agresif scrapers / spam bots ───────────────────
                userAgent: [
                    "AhrefsBot",
                    "MJ12bot",
                    "DotBot",
                    "BLEXBot",
                    "SemrushBot",
                    "PetalBot",
                    "MegaIndex",
                    "Sogou",
                ],
                disallow: ["/"],
            },
        ],
        sitemap: [
            "https://www.roxy.my.id/sitemap-index",
            "https://www.roxy.my.id/sitemap_pages.xml",
        ],
        host: "https://www.roxy.my.id",
    };
}
