import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // General rules for all crawlers
                userAgent: "*",
                allow: [
                    "/",
                    "/browse",
                    "/ongoing",
                    "/movies",
                    "/anime/",
                ],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                    "/_next/",
                    "/favicon.ico",
                ],
            },
            {
                // Google: more permissive, can crawl all public pages
                userAgent: "Googlebot",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // Bing
                userAgent: "Bingbot",
                allow: ["/"],
                disallow: [
                    "/api/",
                    "/auth/",
                    "/profile/",
                ],
            },
            {
                // Block AI training bots
                userAgent: [
                    "GPTBot",
                    "ChatGPT-User",
                    "Google-Extended",
                    "CCBot",
                    "anthropic-ai",
                    "Claude-Web",
                ],
                disallow: ["/"],
            },
        ],
        sitemap: "https://roxy.my.id/sitemap.xml",
        host: "https://roxy.my.id",
    };
}
