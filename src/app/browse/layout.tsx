import { Suspense } from "react";
import { Metadata } from "next";
import { AnimeCardSkeleton } from "@/components/common";

export const metadata: Metadata = {
  title: "Cari Anime Sub Indo — Browse Lengkap Semua Genre",
  description: "Cari dan temukan ribuan judul anime subtitle Indonesia gratis. Filter berdasarkan genre, status ongoing/completed, dan rating. Koleksi terlengkap di RoxyNime.",
  alternates: { canonical: "https://roxy.my.id/browse" },
  keywords: [
    "cari anime sub indo",
    "daftar anime sub indo lengkap",
    "anime genre action sub indo",
    "anime genre romance sub indo",
    "anime genre isekai sub indo",
    "filter anime berdasarkan genre",
  ],
  openGraph: {
    title: "Cari Anime Sub Indo — Browse Semua Genre | RoxyNime",
    description: "Temukan ribuan judul anime subtitle Indonesia gratis. Filter berdasarkan genre, status, dan rating.",
    url: "https://roxy.my.id/browse",
    type: "website",
    locale: "id_ID",
    siteName: "RoxyNime",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cari Anime Sub Indo — Browse Semua Genre | RoxyNime",
    description: "Temukan ribuan judul anime sub indo gratis. Filter genre, status & rating.",
  },
};

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<BrowseLoading />}>
            {children}
        </Suspense>
    );
}

function BrowseLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="skeleton h-8 w-48 mb-2 rounded" />
                <div className="skeleton h-4 w-72 rounded" />
            </div>
            <div className="skeleton h-12 w-full mb-8 rounded-lg" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {Array.from({ length: 20 }).map((_, i) => (
                    <AnimeCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        </div>
    );
}
