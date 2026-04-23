import { Metadata } from "next";
import { getAnimeSchedule } from "@/lib/animbus";
import { Calendar } from "lucide-react";
import { AnimeCard } from "@/components/anime/AnimeCard";

export const metadata: Metadata = {
    title: "Jadwal Rilis Anime - RoxyNime",
    description: "Jadwal rilis anime terbaru setiap harinya. Pantau kapan anime favoritmu rilis.",
};

const DAYS_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu", "Random"];

export default async function SchedulePage() {
    // Fetch schedule specifically from otakudesu provider
    const scheduleData = await getAnimeSchedule("otakudesu");

    // Sort days based on DAYS_ORDER
    const sortedDays = Object.keys(scheduleData).sort((a, b) => {
        const indexA = DAYS_ORDER.indexOf(a);
        const indexB = DAYS_ORDER.indexOf(b);
        // If a day is not in DAYS_ORDER, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const hasSchedule = sortedDays.length > 0;

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-xl backdrop-blur-sm">
                        <Calendar className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Jadwal Rilis Anime</h1>
                        <p className="text-gray-400 mt-1">Jadwal update mingguan untuk anime on-going.</p>
                    </div>
                </div>

                {!hasSchedule ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                        <h2 className="text-xl font-bold text-gray-300">Belum Ada Jadwal</h2>
                        <p className="text-gray-500">Jadwal rilis anime saat ini tidak tersedia.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sortedDays.map((day) => {
                            const animes = scheduleData[day];
                            if (!animes || animes.length === 0) return null;

                            return (
                                <section key={day} className="animate-fade-in-up">
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                                        <h2 className="text-2xl font-bold text-white capitalize">{day}</h2>
                                        <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-full font-semibold">
                                            {animes.length} Anime
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                                        {animes.map((anime) => (
                                            <AnimeCard
                                                key={anime.id || anime.slug}
                                                id={anime.id}
                                                slug={anime.slug}
                                                title={anime.title}
                                                image={anime.image}
                                                episode={anime.episode}
                                                rating={anime.rating}
                                                type={anime.type}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
