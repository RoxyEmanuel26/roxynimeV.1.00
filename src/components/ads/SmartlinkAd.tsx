import type { ReactNode } from "react";

interface SmartlinkAdProps {
    children: ReactNode;
    /** "A" untuk Set A, "B" untuk Set B */
    set?: "A" | "B";
    className?: string;
}

// FIXED: Smartlink URLs dari balkliving.com
const SMARTLINKS = {
    A: "https://balkliving.com/dxaisxq61?key=2db606c64770c66f9c8bccadac2276ae",
    B: "https://balkliving.com/u8ugix2z?key=c42591f6531e16c64f4d0b96f31a3201",
} as const;

/**
 * SmartlinkAd — Wraps children in a monetized link.
 * Opens in new tab with noopener for security.
 */
export function SmartlinkAd({ children, set = "A", className }: SmartlinkAdProps) {
    return (
        <a
            href={SMARTLINKS[set]}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {children}
        </a>
    );
}
