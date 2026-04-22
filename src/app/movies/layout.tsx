import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nonton Anime Movie Sub Indo",
  description: "Daftar film anime dan anime movie subtitle Indonesia gratis. Nonton anime movie terbaru kualitas HD.",
  alternates: { canonical: "https://roxy.my.id/movies" },
};

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
