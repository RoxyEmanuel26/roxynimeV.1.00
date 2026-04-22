import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Ongoing Terbaru Sub Indo",
  description: "Daftar anime ongoing musim ini. Update setiap hari, nonton anime episode terbaru subtitle Indonesia tercepat.",
  alternates: { canonical: "https://roxy.my.id/ongoing" },
};

export default function OngoingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
