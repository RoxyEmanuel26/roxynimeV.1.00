import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/layout";
import { PopunderAd, StickyMobileAd } from "@/components/ads";
import { DataSaverBanner } from "@/components/common/DataSaverBanner";
import { DisablePrefetch } from "@/components/common/DisablePrefetch";
import { SAVER_CONFIG } from "@/config/dataSaver";
import { VERIFICATION_META_TAGS } from "@/config/ads.config";

export const metadata: Metadata = {
  title: {
    default: "RoxyNime - Watch Anime Online Free",
    template: "%s | RoxyNime",
  },
  description:
    "Stream your favorite anime for free in HD quality. Watch the latest episodes, movies, and series on RoxyNime.",
  keywords: [
    // ── Keywords dasar (sudah ada) ──────────────────────────────────
    "anime", "nonton anime", "anime sub indo", "anime subtitle indonesia",
    "streaming anime", "anime online gratis", "nonton anime gratis",
    "anime terbaru", "anime ongoing", "roxynime",

    // ── Judul anime paling banyak dicari di Google 2025-2026 ────────
    // Sumber: Google Trends, Netflix, Crunchyroll top charts
    "one piece", "one piece sub indo",                  // #1 most searched anime worldwide [web:25]
    "naruto", "naruto shippuden sub indo",              // #2 worldwide, #1 Netflix H1 2025 [web:29]
    "demon slayer", "kimetsu no yaiba sub indo",        // Top Crunchyroll 2025 [web:29]
    "solo leveling", "solo leveling sub indo",          // Crunchyroll Anime of the Year 2025 [web:29]
    "attack on titan", "shingeki no kyojin sub indo",   // Paling banyak dicari di Indonesia [web:13]
    "jujutsu kaisen", "jujutsu kaisen sub indo",        // Top trending [web:13]
    "spy x family", "spy x family sub indo",            // #1 Anime Trending Fall 2025 [web:29]
    "dragon ball", "dragon ball daima sub indo",        // Top 10 Google trending [web:17]
    "my hero academia", "boku no hero academia",
    "black clover sub indo",
    "bleach sub indo", "bleach thousand year blood war",
    "sakamoto days sub indo",                           // Google Top 10 Trending Anime 2025 [web:17]
    "frieren sub indo",                                 // Popular 2025 [web:29]
    "gachiakuta sub indo",                              // Trending 2025 [web:29]

    // ── Kata kunci cara akses / intent pengguna ─────────────────────
    "nonton anime episode terbaru",
    "anime episode 1 sub indo",
    "anime batch sub indo",
    "download anime sub indo",
    "anime lengkap sub indo",
    "samehadaku", "otakudesu", "anoboy",               // Brand competitor — dicari pengguna yang tahu situs sejenis
    "gogoanime sub indo",
    "nonton anime tanpa iklan",
    "anime HD 1080p sub indo",
    "anime season spring 2026",
    "jadwal rilis anime 2026",

    // ── Genre populer ───────────────────────────────────────────────
    "anime action sub indo",
    "anime romance sub indo",
    "anime isekai sub indo",
    "anime fantasy sub indo",
    "anime shounen sub indo",
    "anime seinen sub indo",
    "anime horror sub indo",
    "anime comedy sub indo",
    "anime school sub indo",
    "rekomendasi anime terbaik",
    "anime movie sub indo",
    "anime film bioskop sub indo",
  ],
  authors: [{ name: "RoxyNime" }],
  creator: "RoxyNime",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://roxy.my.id",
    siteName: "RoxyNime",
    title: "RoxyNime - Watch Anime Online Free",
    description:
      "Stream your favorite anime for free in HD quality. Watch the latest episodes, movies, and series on RoxyNime.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoxyNime - Watch Anime Online Free",
    description:
      "Stream your favorite anime for free in HD quality. Watch the latest episodes, movies, and series on RoxyNime.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://roxy.my.id",
  },
  verification: {
    google: "lxQwbH-7VW2FYYEneCTqBQn17blivO8GECadcUZxyz0",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {VERIFICATION_META_TAGS.map((tag, idx) => (
          <meta key={idx} name={tag.name} content={tag.content} />
        ))}
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {!SAVER_CONFIG.MODE_HEMAT && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
              href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
              rel="stylesheet"
            />
            {/* Inject CSS variables for tailwind if needed */}
            <style dangerouslySetInnerHTML={{ __html: `:root { --font-sans: 'Inter', sans-serif; --font-heading: 'Outfit', sans-serif; }` }} />
          </>
        )}
      </head>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "RoxyNime",
              "url": "https://roxy.my.id",
              "description": "Nonton anime sub indo online gratis",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://roxy.my.id/browse?search={search_term}",
                "query-input": "required name=search_term"
              }
            })
          }}
        />
        <Providers>
          <DisablePrefetch />
          <DataSaverBanner />
          <PopunderAd />
          <Header />
          <main className="flex-1 pb-14 lg:pb-0">{children}</main>
          <StickyMobileAd />
          <Footer />
        </Providers>
      </body>
    </html >
  );
}
