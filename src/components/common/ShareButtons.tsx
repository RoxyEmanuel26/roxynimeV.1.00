"use client";

import { useState, useEffect } from "react";
import { Share2, Twitter, Facebook, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
    url: string;
    title: string;
    image?: string;
}

export function ShareButtons({ url, title, image }: ShareButtonsProps) {
    const [mounted, setMounted] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(url);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        // Use full URL if we're on the client and the provided URL is a path
        if (url.startsWith("/") && typeof window !== "undefined") {
            setCurrentUrl(window.location.origin + url);
        } else if (!url.startsWith("http") && typeof window !== "undefined") {
            setCurrentUrl(window.location.href);
        }
    }, [url]);

    if (!mounted) return null;

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedImage = image ? encodeURIComponent(image) : "";

    const shareLinks = {
        pinterest: `https://id.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${image ? `&media=${encodedImage}` : ""}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20%2D%20${encodedUrl}`
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Share2 className="w-4 h-4" /> Share:
            </span>
            <div className="flex items-center gap-2">
                {/* Pinterest */}
                <a
                    href={shareLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#E60023] text-white rounded-full hover:opacity-80 transition-opacity"
                    title="Share to Pinterest"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="fill-current stroke-none">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345l-.288 1.148c-.05.204-.166.248-.373.151-1.389-.643-2.254-2.659-2.254-4.288 0-3.487 2.533-6.691 7.315-6.691 3.843 0 6.828 2.738 6.828 6.398 0 3.821-2.407 6.899-5.748 6.899-1.123 0-2.18-.584-2.542-1.274l-.693 2.641c-.25.954-.925 2.148-1.378 2.879 1.096.335 2.259.516 3.46.516 6.621 0 11.988-5.368 11.988-11.988 0-6.62-5.367-11.987-11.987-11.987z" />
                    </svg>
                </a>
                
                {/* Facebook */}
                <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-80 transition-opacity"
                    title="Share to Facebook"
                >
                    <Facebook className="w-4 h-4" />
                </a>

                {/* Twitter / X */}
                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-black text-white rounded-full hover:opacity-80 transition-opacity dark:border dark:border-gray-700"
                    title="Share to X (Twitter)"
                >
                    <Twitter className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#25D366] text-white rounded-full hover:opacity-80 transition-opacity"
                    title="Share to WhatsApp"
                >
                    <MessageCircle className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
