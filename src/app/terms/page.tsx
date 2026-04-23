import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — RoxyNime",
    description: "Syarat dan Ketentuan penggunaan layanan RoxyNime.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    Terms of Service
                </h1>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Penerimaan Syarat</h2>
                        <p>
                            Dengan mengakses dan menggunakan RoxyNime, Anda setuju untuk mematuhi Syarat dan Ketentuan Layanan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, Anda dilarang menggunakan situs kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Sifat Layanan</h2>
                        <p>
                            RoxyNime adalah mesin pencari dan indeks konten (agregator) yang mengumpulkan tautan video dari pihak ketiga. Kami tidak menyimpan, mengunggah, atau meng-host file media apa pun di server kami sendiri. Semua konten disediakan oleh pihak ketiga tanpa berafiliasi dengan kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Penggunaan yang Diizinkan</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Layanan ini disediakan hanya untuk penggunaan pribadi dan non-komersial.</li>
                            <li>Anda setuju untuk tidak menggunakan situs ini untuk tujuan ilegal atau melanggar hukum.</li>
                            <li>Anda dilarang menggunakan bot, scraper, atau perangkat lunak otomatis lainnya untuk mengambil data dari RoxyNime tanpa izin.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Disclaimer (Penafian)</h2>
                        <p>
                            RoxyNime disediakan &quot;sebagaimana adanya&quot; tanpa jaminan apa pun, baik tersurat maupun tersirat. Kami tidak bertanggung jawab atas kerugian, kerusakan, atau masalah hukum yang timbul dari penggunaan situs kami atau tautan eksternal yang diindeks.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Perubahan Syarat</h2>
                        <p>
                            Kami berhak mengubah atau merevisi Syarat dan Ketentuan ini kapan saja. Perubahan akan segera berlaku setelah dipublikasikan di halaman ini. Penggunaan berkelanjutan Anda atas situs ini merupakan bentuk penerimaan terhadap perubahan tersebut.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
