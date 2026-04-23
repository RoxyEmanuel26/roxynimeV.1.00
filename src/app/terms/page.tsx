import { Metadata } from "next";
import { Scale, FileText, AlertCircle, Shield } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms of Service and usage conditions for RoxyNime.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                    <p className="text-muted-foreground mt-1">Last updated: April 2026</p>
                </div>
            </div>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing and using RoxyNime (https://www.roxy.my.id), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        2. Content Disclaimer
                    </h2>
                    <p>
                        RoxyNime does not host any files on its servers. All videos, images, and content are hosted on third-party services and provided by non-affiliated third parties. RoxyNime is simply a portal that indexes external content over which we exercise no control.
                    </p>
                    <p className="mt-4">
                        We are not responsible for the legality, accuracy, compliance, copyright, or any other aspect of the content of other linked sites. 
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        3. User Conduct
                    </h2>
                    <p>
                        Users must not engage in any activity that causes, or may cause, damage to the website or impairment of the availability or accessibility of RoxyNime. You must not use our website in any way which is unlawful, illegal, fraudulent, or harmful.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        4. Changes to Terms
                    </h2>
                    <p>
                        We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
                    </p>
                </section>
            </div>
        </div>
    );
}
