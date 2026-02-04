import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md">
                {/* 404 Illustration */}
                <div className="relative">
                    <span className="text-[150px] font-bold gradient-text opacity-20">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">🎬</span>
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                    <p className="text-muted-foreground">
                        Oops! The anime or page you&apos;re looking for doesn&apos;t exist or has been
                        moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/" className="btn-primary px-6">
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
                    <Link href="/browse" className="btn-outline px-6">
                        <Search className="h-4 w-4" />
                        Browse Anime
                    </Link>
                </div>
            </div>
        </div>
    );
}
