import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Ongoing Terbaru Sub Indo — Update Setiap Hari",
  description: "Daftar lengkap anime ongoing musim ini dengan subtitle Indonesia. Update episode terbaru setiap hari, streaming gratis kualitas HD di RoxyNime.",
  alternates: { canonical: "https://roxy.my.id/ongoing" },
  keywords: [
    "anime ongoing sub indo",
    "anime ongoing terbaru",
    "anime musim ini sub indo",
    "anime spring 2026",
    "daftar anime ongoing",
    "update anime terbaru",
  ],
  openGraph: {
    title: "Anime Ongoing Terbaru Sub Indo — Update Setiap Hari | RoxyNime",
    description: "Daftar lengkap anime ongoing musim ini dengan subtitle Indonesia. Update episode terbaru setiap hari, streaming gratis kualitas HD.",
    url: "https://roxy.my.id/ongoing",
    type: "website",
    locale: "id_ID",
    siteName: "RoxyNime",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Ongoing Terbaru Sub Indo | RoxyNime",
    description: "Daftar anime ongoing musim ini. Update episode terbaru setiap hari, streaming gratis HD.",
  },
};

export default function OngoingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
