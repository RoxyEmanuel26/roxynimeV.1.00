"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ReactNode, type MouseEvent } from "react";
import { useAdClick } from "@/hooks/useAdClick";

interface AdLinkProps {
    /** The destination URL (same as Next.js Link href) */
    href: string;
    /** Unique key for this link — used to track if ad was shown */
    adKey: string;
    /** Children to render inside the link */
    children: ReactNode;
    /** Extra className */
    className?: string;
    /** Any other props to pass through */
    [key: string]: any;
}

/**
 * AdLink — Drop-in replacement for <Link> with two-click ad redirect.
 *
 * First click: opens random ad in new tab, stays on current page.
 * Second click: navigates to the actual destination.
 */
export function AdLink({ href, adKey, children, className, ...rest }: AdLinkProps) {
    const { interceptClick } = useAdClick(adKey);
    const router = useRouter();

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            const wasIntercepted = interceptClick();
            if (wasIntercepted) {
                e.preventDefault();
                // Don't navigate, ad was opened instead
            }
            // If not intercepted, let the default Link navigation happen
        },
        [interceptClick]
    );

    return (
        <Link href={href} className={className} onClick={handleClick} {...rest}>
            {children}
        </Link>
    );
}
