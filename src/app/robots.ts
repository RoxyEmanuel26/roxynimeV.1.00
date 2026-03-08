import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/browse", "/ongoing", "/movies", "/anime/"],
                disallow: ["/api/", "/auth/", "/profile/", "/_next/"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: "https://roxy.my.id/sitemap.xml",
        host: "https://roxy.my.id",
    };
}
