"use client";

import Script from "next/script";

/**
 * PopunderAd — Global popunder + social bar scripts.
 * Loaded ONCE in layout.tsx via next/script with afterInteractive strategy.
 */
export function PopunderAd() {
    return (
        <>
            {/* Popunder Set A */}
            <Script
                src="https://balkliving.com/e2/d3/56/e2d356aca9584a647a64631eb3463720.js"
                strategy="afterInteractive"
            />
            {/* Popunder Set B */}
            <Script
                src="https://balkliving.com/a2/92/18/a29218ac83917d59f19c700bc4e955f0.js"
                strategy="afterInteractive"
            />
            {/* Social Bar Set A */}
            <Script
                src="https://balkliving.com/fd/f7/a9/fdf7a973cb967e980f7e25db2aa04a1c.js"
                strategy="afterInteractive"
            />
            {/* Social Bar Set B */}
            <Script
                src="https://balkliving.com/8a/4f/02/8a4f02d663cdde891e3adaa6ac1e5140.js"
                strategy="afterInteractive"
            />

            {/* Monetag Ads */}
            <Script id="monetag-1" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702024',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script src="https://quge5.com/88/tag.min.js" data-zone="217868" strategy="afterInteractive" />
            <Script src="https://5gvci.com/act/files/tag.min.js?z=10702028" strategy="afterInteractive" />
            <Script id="monetag-2" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702046',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-3" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702048',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-4" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702050',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-5" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702051',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-6" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702052',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-7" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702053',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
            <Script id="monetag-8" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `(function(s){s.dataset.zone='10702055',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))` }} />
        </>
    );
}
