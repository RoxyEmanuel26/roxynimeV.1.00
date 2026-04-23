import { Metadata } from "next";
import { Copyright, Scale, Info, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "DMCA",
    description: "Digital Millennium Copyright Act (DMCA) policy for RoxyNime.",
};

export default function DMCAPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Copyright className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">DMCA Policy</h1>
                    <p className="text-muted-foreground mt-1">Digital Millennium Copyright Act Notice</p>
                </div>
            </div>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 border-l-4 border-l-primary">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        Disclaimer
                    </h2>
                    <p>
                        <strong>RoxyNime does not host any of the video files or content found on this website.</strong>
                    </p>
                    <p className="mt-2">
                        All videos are hosted by third-party services (such as Google Drive, DoodStream, Mp4Upload, Vidmoly, etc.) and are simply embedded or linked to on RoxyNime. We have no control over the content of these third-party websites and are not responsible for their content or operations.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        Copyright Infringement
                    </h2>
                    <p>
                        RoxyNime is in compliance with 17 U.S.C. § 512 and the Digital Millennium Copyright Act (DMCA). It is our policy to respond to any infringement notices and take appropriate actions under the Digital Millennium Copyright Act and other applicable intellectual property laws.
                    </p>
                    <p className="mt-4">
                        If your copyrighted material has been posted on RoxyNime or if hyperlinks to your copyrighted material are returned through our search engine and you want this material removed, you must provide a written communication that details the information listed in the following section.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        Removal Request Requirements
                    </h2>
                    <ul className="list-disc list-inside space-y-3 marker:text-primary">
                        <li>Provide evidence of the authorized person to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
                        <li>Provide sufficient contact information so that we may contact you. You must also include a valid email address.</li>
                        <li>Identify the copyrighted work claimed to have been infringed, or if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works at that site.</li>
                        <li>Identify the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit the service provider to locate the material (i.e. URL).</li>
                        <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                        <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
                    </ul>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Submit a Takedown Notice
                        </h2>
                        <p className="text-sm">
                            Send the infringement notice via email to the address provided on our Contact page. Please allow up to 2-3 business days for an email response.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
