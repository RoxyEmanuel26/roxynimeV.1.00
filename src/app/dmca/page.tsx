import { Metadata } from "next";

export const metadata: Metadata = {
    title: "DMCA — RoxyNime",
    description: "Digital Millennium Copyright Act (DMCA) Disclaimer untuk RoxyNime.",
};

export default function DMCAPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    DMCA Disclaimer
                </h1>

                <div className="space-y-8 text-muted-foreground leading-relaxed">
                    <section>
                        <p>
                            RoxyNime respects the intellectual property rights of others. We comply with the Digital Millennium Copyright Act (DMCA) and other applicable copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. No Hosted Content</h2>
                        <p>
                            RoxyNime operates solely as a search engine and directory for anime links. <strong>We do not host, upload, or store any video, media file, or copyright-protected material on our servers.</strong> All content is hosted by non-affiliated third parties and content delivery networks across the internet.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Takedown Requests</h2>
                        <p>
                            Since we do not host the files, we cannot remove content from third-party servers. If you find a link on our site that points to your copyrighted material and you wish for it to be removed from our index, please contact us. Note that removing a link from our directory will not remove the actual video from the internet. You must contact the respective video hosting provider to take down the file.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. How to Submit a Notice</h2>
                        <p className="mb-3">
                            If you represent a copyright owner and wish to request the removal of a specific URL from our directory, please provide a written notification containing:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner.</li>
                            <li>Identification of the copyrighted work claimed to have been infringed.</li>
                            <li>Exact URL(s) on our website where the link to the infringing material is located.</li>
                            <li>Your contact information, including email address and phone number.</li>
                            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
                        </ul>
                    </section>

                    <section>
                        <p>
                            Silakan ajukan permintaan penghapusan DMCA Anda melalui halaman <a href="/contact" className="text-primary hover:underline font-medium">Contact</a> kami. Kami akan memproses permintaan penghapusan URL yang valid dalam waktu 3-5 hari kerja.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
