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

const SITE_URL = "https://roxy.my.id";
const SITE_NAME = "RoxyNime";
const DEFAULT_TITLE = "RoxyNime - Nonton Anime Sub Indo Gratis Streaming HD Terlengkap 2026";
const DEFAULT_DESC = "Nonton anime sub indo gratis streaming HD di RoxyNime. Update episode terbaru setiap hari dari Otakudesu & Samehadaku. Anime ongoing, completed, dan film anime lengkap dengan subtitle Indonesia. Kualitas 720p & 1080p.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESC,
  keywords: [
    // ── Primary keywords (high volume) ──
    "nonton anime sub indo",
    "streaming anime gratis",
    "anime subtitle indonesia",
    "nonton anime online",
    "anime sub indo gratis",
    // ── Secondary keywords ──
    "anime ongoing sub indo",
    "anime terbaru 2026",
    "anime spring 2026",
    "anime completed sub indo",
    "download anime sub indo",
    "anime batch sub indo",
    "anime HD 1080p sub indo",
    // ── Brand keywords ──
    "roxynime",
    "otakudesu",
    "samehadaku",
    // ── Long-tail keywords ──
    "nonton anime ongoing terbaru",
    "streaming anime movie sub indo",
    "jadwal rilis anime terbaru",
    "rekomendasi anime 2026",
    "anime populer subtitle indonesia",
    "anime spring summer 2026",
    "situs nonton anime legal gratis",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Entertainment",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Situs Nonton Anime Sub Indo Gratis Terlengkap`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
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
    canonical: SITE_URL,
    languages: {
      "id-ID": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  verification: {
    google: "lxQwbH-7VW2FYYEneCTqBQn17blivO8GECadcUZxyz0",
  },
  manifest: "/manifest.json",
  other: {
    "google-site-verification": "lxQwbH-7VW2FYYEneCTqBQn17blivO8GECadcUZxyz0",
  },
};

// ── JSON-LD Structured Data (global) ──────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESC,
      inLanguage: "id-ID",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/browse?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "id-ID",
    },
    {
      "@type": "SiteNavigationElement",
      name: ["Home", "Browse", "Ongoing", "Movies", "Jadwal"],
      url: [
        SITE_URL,
        `${SITE_URL}/browse`,
        `${SITE_URL}/ongoing`,
        `${SITE_URL}/movies`,
        `${SITE_URL}/schedule`,
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Browse Anime",
          item: `${SITE_URL}/browse`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Anime Ongoing",
          item: `${SITE_URL}/ongoing`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Anime Movies",
          item: `${SITE_URL}/movies`,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "Jadwal Anime",
          item: `${SITE_URL}/schedule`,
        },
      ],
    },
  ],
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
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Preconnect to API server for faster data fetching */}
        <link rel="preconnect" href="https://www.sankavollerei.com" />
        <link rel="dns-prefetch" href="https://www.sankavollerei.com" />
        {/* Preconnect to image CDNs */}
        <link rel="dns-prefetch" href="https://cdn.myanimelist.net" />
        <link rel="dns-prefetch" href="https://i0.wp.com" />
      </head>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col`}
      >
        {/* ── JSON-LD Structured Data ──────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
