"use client";

import { useEffect, useRef } from "react";

interface BannerAdProps {
    adKey: string;
    width: number;
    height: number;
    className?: string;
}

/**
 * BannerAd — Reusable atOptions-based banner ad component.
 * Sets atOptions BEFORE loading invoke.js to satisfy Adsterra's requirement.
 */
export function BannerAd({ adKey, width, height, className }: BannerAdProps) {
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bannerRef.current || bannerRef.current.firstChild) return;

        const conf = document.createElement("script");
        const script = document.createElement("script");

        conf.type = "text/javascript";
        conf.innerHTML = `atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
        };`;

        script.type = "text/javascript";
        script.src = `https://glamournakedemployee.com/${adKey}/invoke.js`;

        bannerRef.current.appendChild(conf);
        bannerRef.current.appendChild(script);
    }, [adKey, width, height]);

    return (
        <div className={`flex justify-center items-center w-full overflow-hidden ${className || ""}`}>
            <div ref={bannerRef} className="w-full flex justify-center items-center min-h-[90px]"></div>
        </div>
    );
}
