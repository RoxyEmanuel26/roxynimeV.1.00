import { Metadata } from "next";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with the RoxyNime team for inquiries, bug reports, or DMCA notices.",
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
                    <p className="text-muted-foreground mt-1">We'd love to hear from you</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6 text-muted-foreground">
                    <p className="text-lg">
                        Have a question, feedback, or a business inquiry? Feel free to reach out to us using the contact information below.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Email</h3>
                                <p className="mt-1">roxyemanuel@roxy.my.id</p>
                                <p className="text-sm mt-2">For general inquiries, bug reports, or business proposals.</p>
                            </div>
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Social Media</h3>
                                <p className="mt-1">Follow us for updates</p>
                                <div className="mt-3 flex gap-3">
                                    <a href="RoxyEmanuel" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                    </a>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Name</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Email</label>
                            <input
                                type="email"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Subject</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="What is this about?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-foreground">Message</label>
                            <textarea
                                rows={5}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                placeholder="Your message here..."
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2.5 rounded-xl transition-colors mt-2"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
