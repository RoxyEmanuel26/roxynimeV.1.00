import Link from "next/link";
import { Play } from "lucide-react";

export function HeroFallback() {
    return (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden flex items-center justify-center">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9] to-[#7C3AED]" />
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight drop-shadow-lg">
                    RoxyNime
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md">
                    Nonton Anime Sub Indo Gratis, Update Setiap Hari!
                </p>

                <div className="pt-4 flex items-center justify-center">
                    <Link
                        href="/browse"
                        className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
                    >
                        <Play className="h-5 w-5 fill-current" />
                        Browse Anime
                    </Link>
                </div>
            </div>

            {/* Bottom fading overlay for blending with page */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    );
}
