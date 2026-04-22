import { Metadata } from "next";
import { sankaClient } from "@/lib/sankaClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const animeId = slug[0];
    const episodeSlug = slug[1] || "1";
    
    let title = animeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let description = `Streaming video ${title} Episode ${episodeSlug} subtitle Indonesia resolusi 1080p, 720p, 480p tanpa buffer.`;
    let poster = "https://roxy.my.id/placeholder-anime.svg";

    try {
        const anime = await sankaClient.getDetail(animeId);
        title = anime.title;
        poster = anime.poster || poster;
        description = `Nonton streaming ${title} Episode ${episodeSlug} subtitle Indonesia. ${anime.synopsis ? anime.synopsis.slice(0, 100) + '...' : ''}`.trim();
    } catch (e) {
        // Ignore and use fallback
    }

    return {
        title: `Nonton ${title} Episode ${episodeSlug} Sub Indo — RoxyNime`,
        description: description,
        keywords: [
            `nonton ${title} eps ${episodeSlug}`, 
            `${title} episode ${episodeSlug} sub indo`, 
            `streaming ${title} episode ${episodeSlug}`,
            `${title} terbaru`
        ],
        alternates: { canonical: `https://roxy.my.id/watch/${animeId}/${episodeSlug}` },
        openGraph: {
            title: `Nonton ${title} Episode ${episodeSlug} Sub Indo — RoxyNime`,
            description: description,
            url: `https://roxy.my.id/watch/${animeId}/${episodeSlug}`,
            images: [poster],
            type: "video.episode",
        },
        robots: { index: true, follow: true }
    };
}

export default async function WatchLayout({ 
    children, 
    params 
}: { 
    children: React.ReactNode;
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    const animeId = slug[0];
    const episodeSlug = slug[1] || "1";

    let title = animeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let poster = "https://roxy.my.id/placeholder-anime.svg";
    let synopsis = `Nonton anime ${title} sub indo gratis di RoxyNime.`;

    try {
        const anime = await sankaClient.getDetail(animeId);
        title = anime.title;
        poster = anime.poster || poster;
        synopsis = anime.synopsis || synopsis;
    } catch (e) {
        // Ignore
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoObject",
                        "name": `${title} Episode ${episodeSlug} Sub Indo`,
                        "description": `Nonton streaming ${title} Episode ${episodeSlug} subtitle Indonesia. ${synopsis}`,
                        "thumbnailUrl": poster,
                        "uploadDate": new Date().toISOString(),
                    })
                }}
            />
            {children}
        </>
    );
}
