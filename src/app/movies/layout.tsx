import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nonton Anime Movie Sub Indo — Film Anime Terlengkap",
  description: "Koleksi lengkap film anime dan anime movie subtitle Indonesia gratis. Nonton anime movie terbaru kualitas HD streaming tanpa ribet di RoxyNime.",
  alternates: { canonical: "https://roxy.my.id/movies" },
  keywords: [
    "anime movie sub indo",
    "film anime sub indo",
    "nonton anime movie gratis",
    "anime movie terbaru 2026",
    "download anime movie sub indo",
    "streaming film anime HD",
  ],
  openGraph: {
    title: "Nonton Anime Movie Sub Indo — Film Anime Terlengkap | RoxyNime",
    description: "Koleksi lengkap film anime dan anime movie subtitle Indonesia gratis. Streaming kualitas HD tanpa ribet.",
    url: "https://roxy.my.id/movies",
    type: "website",
    locale: "id_ID",
    siteName: "RoxyNime",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nonton Anime Movie Sub Indo | RoxyNime",
    description: "Koleksi lengkap film anime sub indo gratis. Streaming kualitas HD.",
  },
};

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
