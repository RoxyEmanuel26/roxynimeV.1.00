"use client";

import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
    className?: string;
}

/**
 * SidebarAd — Desktop sidebar with sticky 160x600 + 160x300 banners.
 * Uses direct DOM script injection for balkliving.com Adsterra ads.
 */
export function SidebarAd({ className }: SidebarAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const uniqueId = useId().replace(/:/g, "");

    useEffect(() => {
        if (loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        const container = containerRef.current;

        // FIXED: Banner 160x600 (Set A — d558679ec97b5a1d31760db5c4fbfb64)
        const wrapper1 = document.createElement("div");
        wrapper1.style.marginBottom = "16px";
        const opts1 = document.createElement("script");
        opts1.type = "text/javascript";
        opts1.text = `atOptions = { 'key':'d558679ec97b5a1d31760db5c4fbfb64', 'format':'iframe', 'height':600, 'width':160, 'params':{} };`;
        wrapper1.appendChild(opts1);
        const inv1 = document.createElement("script");
        inv1.type = "text/javascript";
        inv1.src = "https://balkliving.com/d558679ec97b5a1d31760db5c4fbfb64/invoke.js";
        inv1.async = true;
        wrapper1.appendChild(inv1);
        container.appendChild(wrapper1);

        // FIXED: Banner 160x300 (Set A — 46421676e05ae211a7a3703868357be3)
        const wrapper2 = document.createElement("div");
        wrapper2.style.marginBottom = "16px";
        const opts2 = document.createElement("script");
        opts2.type = "text/javascript";
        opts2.text = `atOptions = { 'key':'46421676e05ae211a7a3703868357be3', 'format':'iframe', 'height':300, 'width':160, 'params':{} };`;
        wrapper2.appendChild(opts2);
        const inv2 = document.createElement("script");
        inv2.type = "text/javascript";
        inv2.src = "https://balkliving.com/46421676e05ae211a7a3703868357be3/invoke.js";
        inv2.async = true;
        wrapper2.appendChild(inv2);
        container.appendChild(wrapper2);

        // FIXED: Banner 160x300 (Set B — c6c61680cd72bd1e008d3e726deca30a)
        const wrapper3 = document.createElement("div");
        const opts3 = document.createElement("script");
        opts3.type = "text/javascript";
        opts3.text = `atOptions = { 'key':'c6c61680cd72bd1e008d3e726deca30a', 'format':'iframe', 'height':300, 'width':160, 'params':{} };`;
        wrapper3.appendChild(opts3);
        const inv3 = document.createElement("script");
        inv3.type = "text/javascript";
        inv3.src = "https://balkliving.com/c6c61680cd72bd1e008d3e726deca30a/invoke.js";
        inv3.async = true;
        wrapper3.appendChild(inv3);
        container.appendChild(wrapper3);
    }, []);

    return (
        <aside
            className={cn(
                "hidden xl:block w-[180px] shrink-0",
                className
            )}
            aria-label="Sidebar advertisement"
        >
            <div
                ref={containerRef}
                id={`ad-sidebar-${uniqueId}`}
                className="sticky top-4 flex flex-col items-center gap-4"
            />
        </aside>
    );
}
