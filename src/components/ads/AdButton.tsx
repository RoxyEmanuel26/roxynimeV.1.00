"use client";

import { useCallback, type ReactNode, type MouseEvent } from "react";
import { useAdClick } from "@/hooks/useAdClick";

interface AdButtonProps {
    /** Unique key for this button — used to track if ad was shown */
    adKey: string;
    /** The real onClick handler */
    onClick: () => void;
    /** Children to render inside the button */
    children: ReactNode;
    /** Extra className */
    className?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Any other props to pass through */
    [key: string]: any;
}

/**
 * AdButton — Drop-in replacement for <button> with background ad opening.
 *
 * First click: opens random ad in a new tab (background) AND executes onClick.
 * Subsequent clicks: just executes onClick normally.
 */
export function AdButton({ adKey, onClick, children, className, disabled, ...rest }: AdButtonProps) {
    const { interceptClick } = useAdClick(adKey);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;

            // Open ad in background if not yet shown
            interceptClick();

            // Always execute the real handler
            onClick();
        },
        [interceptClick, onClick, disabled]
    );

    return (
        <button className={className} onClick={handleClick} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}

