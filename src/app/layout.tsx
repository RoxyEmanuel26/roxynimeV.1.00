import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Footer } from "@/components/layout";
import { PopunderAd, StickyMobileAd } from "@/components/ads";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "RoxyNime - Watch Anime Online Free",
    template: "%s | RoxyNime",
  },
  description:
    "Stream your favorite anime for free in HD quality. Watch the latest episodes, movies, and series on RoxyNime.",
  keywords: [
    "anime",
    "nonton anime",
    "anime sub indo",
    "anime subtitle indonesia",
    "streaming anime",
    "anime online gratis",
    "nonton anime gratis",
    "anime terbaru",
    "anime ongoing",
    "roxynime",
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
  // Daftarkan di: https://search.google.com/search-console
  // Lalu aktifkan: verification: { google: "kode_dari_GSC" },
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
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
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
          <PopunderAd />
          <Header />
          <main className="flex-1 pb-14 lg:pb-0">{children}</main>
          <StickyMobileAd />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
