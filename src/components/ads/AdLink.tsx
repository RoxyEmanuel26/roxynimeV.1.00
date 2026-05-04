"use client";

import Link from "next/link";
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
 * AdLink — Drop-in replacement for <Link> with background ad opening.
 *
 * First click: opens random ad in a new tab (background) AND navigates
 *              to the destination on the current tab simultaneously.
 * Subsequent clicks: navigates normally without opening ads.
 */
export function AdLink({ href, adKey, children, className, ...rest }: AdLinkProps) {
    const { interceptClick } = useAdClick(adKey);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            // Open ad in background if not yet shown — does NOT block navigation
            interceptClick();
            // Let the default Link navigation happen regardless
        },
        [interceptClick]
    );

    return (
        <Link href={href} className={className} onClick={handleClick} {...rest}>
            {children}
        </Link>
    );
}
