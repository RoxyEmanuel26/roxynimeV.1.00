import type { ReactNode } from "react";

interface SmartlinkAdProps {
    children: ReactNode;
    set?: "A" | "B";
    className?: string;
}

export function SmartlinkAd({ children, className }: SmartlinkAdProps) {
    return <div className={className}>{children}</div>;
}
