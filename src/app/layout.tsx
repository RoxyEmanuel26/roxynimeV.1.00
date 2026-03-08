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
    "streaming",
    "watch anime",
    "free anime",
    "anime online",
    "HD anime",
  ],
  authors: [{ name: "RoxyNime" }],
  creator: "RoxyNime",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roxynime.com",
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
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
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
