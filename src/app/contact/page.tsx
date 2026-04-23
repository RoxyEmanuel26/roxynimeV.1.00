import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us — RoxyNime",
    description: "Hubungi RoxyNime untuk pertanyaan, laporan bug, atau permintaan DMCA.",
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen flex items-center justify-center">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden w-full max-w-2xl text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    Contact Us
                </h1>

                <p className="text-muted-foreground mb-8 text-lg">
                    Kami selalu terbuka untuk mendengar dari Anda!
                </p>

                <div className="space-y-6 text-left max-w-md mx-auto">
                    <div className="bg-background/50 p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground mb-2">Email Dukungan</h3>
                        <p className="text-muted-foreground mb-4">Untuk pertanyaan umum, pelaporan bug, atau masalah teknis.</p>
                        <a href="mailto:support@roxy.my.id" className="text-primary hover:underline font-medium flex items-center gap-2">
                            <span>✉️</span> support@roxy.my.id
                        </a>
                    </div>

                    <div className="bg-background/50 p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground mb-2">DMCA & Legal</h3>
                        <p className="text-muted-foreground mb-4">Untuk permintaan penghapusan DMCA atau masalah hak cipta. Harap sertakan URL spesifik yang dipermasalahkan.</p>
                        <a href="mailto:dmca@roxy.my.id" className="text-primary hover:underline font-medium flex items-center gap-2">
                            <span>⚖️</span> dmca@roxy.my.id
                        </a>
                    </div>
                </div>

                <div className="mt-12 text-sm text-muted-foreground">
                    <p>Kami biasanya membalas dalam waktu 1-3 hari kerja.</p>
                </div>
            </div>
        </div>
    );
}
