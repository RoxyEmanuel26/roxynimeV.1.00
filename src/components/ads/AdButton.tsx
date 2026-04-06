"use client";

import { useCallback, type ReactNode, type MouseEvent } from "react";
import { useAdClick } from "@/hooks/useAdClick";

interface AdButtonProps {
    /** Unique key for this button — used to track if ad was shown */
    adKey: string;
    /** The real onClick handler to execute on 2nd click */
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
 * AdButton — Drop-in replacement for <button> with two-click ad redirect.
 *
 * First click: opens random ad in new tab, does NOT execute onClick.
 * Second click: executes the real onClick handler.
 */
export function AdButton({ adKey, onClick, children, className, disabled, ...rest }: AdButtonProps) {
    const { interceptClick } = useAdClick(adKey);

    const handleClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;

            const wasIntercepted = interceptClick();
            if (wasIntercepted) {
                // Ad was opened, don't execute the real onClick
                return;
            }

            // Second click — execute the real handler
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
