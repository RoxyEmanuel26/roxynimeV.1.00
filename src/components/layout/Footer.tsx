import Link from "next/link";
import { Github, Twitter, Heart } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-border bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg" />
                                <div className="absolute inset-0.5 bg-background rounded-lg flex items-center justify-center">
                                    <span className="text-xl font-bold gradient-text">R</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold">
                                <span className="gradient-text">Roxy</span>
                                <span className="text-foreground">Nime</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your ultimate destination for streaming anime. Watch your favorite shows in high quality.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Browse Anime
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?type=ongoing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Ongoing Series
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?type=movie" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Movies
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Genres */}
                    <div>
                        <h4 className="font-semibold mb-4">Popular Genres</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/browse?genre=action" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Action
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?genre=romance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Romance
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?genre=comedy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Comedy
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?genre=fantasy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Fantasy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/dmca" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    DMCA
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} RoxyNime. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Made with <Heart className="h-4 w-4 text-destructive fill-destructive" /> for anime fans
                    </p>
                </div>

                {/* Disclaimer */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground/60">
                        RoxyNime does not store any files on our server. All contents are provided by non-affiliated third parties.
                    </p>
                </div>
            </div>
        </footer>
    );
}
