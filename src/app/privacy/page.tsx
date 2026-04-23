import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — RoxyNime",
    description: "Kebijakan Privasi terkait pengumpulan dan penggunaan data Anda di RoxyNime.",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    Privacy Policy
                </h1>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Informasi yang Kami Kumpulkan</h2>
                        <p>
                            RoxyNime menghargai privasi Anda. Kami secara otomatis menerima dan menyimpan informasi tertentu dari browser Anda, seperti alamat IP, cookie, dan halaman yang Anda kunjungi, murni untuk keperluan analitik situs dan untuk meningkatkan kualitas layanan (misalnya fitur Riwayat Tontonan).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Penggunaan Cookie</h2>
                        <p>
                            Kami menggunakan &quot;cookies&quot; untuk menyimpan preferensi Anda (seperti pengaturan tema dan riwayat episode). Pihak ketiga, seperti penyedia layanan analitik atau jaringan periklanan, mungkin juga menggunakan cookie untuk menyajikan iklan yang relevan berdasarkan kunjungan Anda ke situs ini dan situs lainnya di internet.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Penyedia Pihak Ketiga</h2>
                        <p>
                            Situs ini memuat API, pemutar video, dan tautan pihak ketiga. Penyedia tersebut mungkin mengumpulkan data Anda sesuai dengan kebijakan privasi mereka sendiri. Kami tidak memiliki kontrol atas cookie atau teknologi pelacakan yang digunakan oleh mereka.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Keamanan Data</h2>
                        <p>
                            Kami berusaha keras melindungi integritas informasi pengguna kami. Karena kami tidak mewajibkan pembuatan akun untuk menonton konten biasa, kami tidak mengumpulkan informasi identitas pribadi secara langsung (seperti nama asli atau alamat).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Hubungi Kami</h2>
                        <p>
                            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui halaman Contact.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
