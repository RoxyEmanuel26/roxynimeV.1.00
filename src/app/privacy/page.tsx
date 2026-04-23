import { Metadata } from "next";
import { ShieldCheck, EyeOff, Cookie, Server } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy and data collection guidelines for RoxyNime.",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground mt-1">Last updated: April 2026</p>
                </div>
            </div>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
                <div className="prose prose-invert max-w-none">
                    <p className="text-lg">
                        At RoxyNime (https://www.roxy.my.id), the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information that is received and collected by RoxyNime and how it is used.
                    </p>
                </div>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        Log Files
                    </h2>
                    <p>
                        Like many other Web sites, RoxyNime makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user&apos;s movement around the site, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Cookie className="w-5 h-5 text-primary" />
                        Cookies and Web Beacons
                    </h2>
                    <p>
                        RoxyNime uses cookies to store information about visitors&apos; preferences, record user-specific information on which pages the user access or visit, customize Web page content based on visitors&apos; browser type or other information that the visitor sends via their browser.
                    </p>
                </section>

                <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-primary" />
                        Third-Party Privacy Policies
                    </h2>
                    <p>
                        You should consult the respective privacy policies of these third-party ad servers for more detailed information on their practices as well as for instructions about how to opt-out of certain practices. RoxyNime&apos;s privacy policy does not apply to, and we cannot control the activities of, such other advertisers or web sites.
                    </p>
                    <p className="mt-4">
                        If you wish to disable cookies, you may do so through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites.
                    </p>
                </section>
            </div>
        </div>
    );
}
