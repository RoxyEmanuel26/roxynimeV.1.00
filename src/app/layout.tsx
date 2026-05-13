import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/layout";
import { PopunderAd, StickyMobileAd } from "@/components/ads";
import { DataSaverBanner } from "@/components/common/DataSaverBanner";
import { DisablePrefetch } from "@/components/common/DisablePrefetch";
import { SAVER_CONFIG } from "@/config/dataSaver";
import { VERIFICATION_META_TAGS } from "@/config/ads.config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roxy.my.id"),
  title: {
    default: "RoxyNime - Nonton Anime Sub Indo Gratis Streaming HD",
    template: "%s | RoxyNime",
  },
  description:
    "Nonton anime sub indo gratis streaming HD di RoxyNime. Update episode terbaru setiap hari, anime ongoing, completed, dan film anime lengkap dengan subtitle Indonesia. Alternatif terbaik otakudesu dan samehadaku.",
  keywords: [
    "nonton anime sub indo",
    "streaming anime gratis",
    "anime subtitle indonesia",
    "anime batch sub indo",
    "anime ongoing sub indo",
    "anime terbaru sub indo",
    "download anime sub indo",
    "anime completed sub indo",
    "anime HD sub indo",
    "nonton anime online",
    "anime gratis",
    "roxynime",
    "samehadaku",
    "otakudesu",
    "nonton anime",
    "anime 2026",
    "anime spring 2026",
    "jadwal anime",
    "rekomendasi anime",
  ],
  authors: [{ name: "RoxyNime", url: "https://roxy.my.id" }],
  creator: "RoxyNime",
  publisher: "RoxyNime",
  category: "Entertainment",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://roxy.my.id",
    siteName: "RoxyNime",
    title: "RoxyNime - Nonton Anime Sub Indo Gratis Streaming HD",
    description: "Nonton anime sub indo gratis streaming HD di RoxyNime. Update episode terbaru setiap hari, anime ongoing, completed, dan film anime lengkap dengan subtitle Indonesia.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "RoxyNime - Situs Nonton Anime Sub Indo Gratis",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoxyNime - Nonton Anime Sub Indo Gratis",
    description: "Nonton anime sub indo gratis streaming HD di RoxyNime. Update episode terbaru setiap hari, anime ongoing, completed, dan film anime.",
    images: ["/og-default.jpg"],
    creator: "@roxynime",
    site: "@roxynime",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://roxy.my.id",
  },
  verification: {
    google: "lxQwbH-7VW2FYYEneCTqBQn17blivO8GECadcUZxyz0",
  },
  manifest: "/manifest.json",
  other: {
    "google-site-verification": "lxQwbH-7VW2FYYEneCTqBQn17blivO8GECadcUZxyz0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {VERIFICATION_META_TAGS.map((tag, idx) => (
          <meta key={idx} name={tag.name} content={tag.content} />
        ))}
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Preconnect to API server for faster data fetching */}
        <link rel="preconnect" href="https://www.sankavollerei.com" />
        <link rel="dns-prefetch" href="https://www.sankavollerei.com" />
      </head>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col`}
      >
        {/* ── JSON-LD Structured Data ──────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://roxy.my.id/#website",
                  "name": "RoxyNime",
                  "url": "https://roxy.my.id",
                  "description": "Nonton anime sub indo gratis streaming HD. Update episode terbaru setiap hari.",
                  "inLanguage": "id-ID",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://roxy.my.id/browse?search={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://roxy.my.id/#organization",
                  "name": "RoxyNime",
                  "url": "https://roxy.my.id",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://roxy.my.id/android-chrome-512x512.png",
                    "width": 512,
                    "height": 512
                  },
                  "sameAs": []
                },
                {
                  "@type": "WebPage",
                  "@id": "https://roxy.my.id/#webpage",
                  "url": "https://roxy.my.id",
                  "name": "RoxyNime - Nonton Anime Sub Indo Gratis Streaming HD",
                  "description": "Nonton anime sub indo gratis streaming HD di RoxyNime. Update episode terbaru setiap hari, anime ongoing, completed, dan film anime lengkap dengan subtitle Indonesia.",
                  "isPartOf": { "@id": "https://roxy.my.id/#website" },
                  "about": { "@id": "https://roxy.my.id/#organization" },
                  "inLanguage": "id-ID"
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": "https://roxy.my.id"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Browse Anime",
                      "item": "https://roxy.my.id/browse"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": "Anime Ongoing",
                      "item": "https://roxy.my.id/ongoing"
                    }
                  ]
                }
              ]
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
