import type { CSSProperties } from "react";

/**
 * ═══════════════════════════════════════════════
 *   RoxyNime — Ad Network Configuration
 * ═══════════════════════════════════════════════
 *
 *  Semua konfigurasi iklan terpusat di file ini.
 *  Komponen iklan (PopunderAd, NativeAd, dll.) membaca dari sini.
 *
 *  Cara mengelola:
 *  1. Tambah/hapus script di section yang sesuai
 *  2. Set enabled: true/false untuk mengaktifkan/mematikan
 *  3. Deploy — komponen akan otomatis membaca config terbaru
 */

// ─── Verification Meta Tags ──────────────────────────────────
// Tag <meta> untuk verifikasi kepemilikan situs di ad network

export const VERIFICATION_META_TAGS = [
    { name: "monetag", content: "f7741fca031b06265f52e59195616470" },
    { name: "a3976e5839396e4d0b02dfeb5a15e654c02367dc", content: "a3976e5839396e4d0b02dfeb5a15e654c02367dc" },
    { name: "monetag", content: "11bb69bb4d641d9b94b196ab5d84532c" },
    { name: "3375b985ef300c04e1dc3bc53816b6b18f34e207", content: "3375b985ef300c04e1dc3bc53816b6b18f34e207" },
    { name: "p:domain_verify", content: "f2c35ca2d67b1ffb5d2db09a6fe825ec" },
];


// ─── Global Scripts (Popunder, Social Bar, dll.) ──────────────
// Script yang di-load sekali di seluruh halaman via <Script> tag

export interface GlobalAdScript {
    /** ID unik untuk script ini */
    id: string;
    /** Tipe iklan */
    type: "popunder" | "social-bar" | "vignette" | "interstitial" | "push-notification" | "other";
    /** Sumber: "adsterra" | "monetag" | dll. */
    network: string;
    /** URL script (untuk tag <script src="...">) */
    src?: string;
    /** Inline script (untuk dangerouslySetInnerHTML) */
    inline?: string;
    /** Aktif atau tidak */
    enabled: boolean;
}

export const GLOBAL_AD_SCRIPTS: GlobalAdScript[] = [

    // ── Adsterra (via balkliving.com) ─────────────────────────

    {
        id: "adsterra-popunder-a",
        type: "popunder",
        network: "adsterra",
        src: "https://glamournakedemployee.com/ba/9b/a2/ba9ba2f9ddd8853b30d8a203c7179958.js",
        enabled: true,
    },
    {
        id: "adsterra-socialbar-a",
        type: "social-bar",
        network: "adsterra",
        src: "https://glamournakedemployee.com/17/34/6f/17346f5e8864f23e6a539e67e940f5b8.js",
        enabled: true,
    },

    // ── Monetag ───────────────────────────────────────────────

    // {
    //     id: "monetag-1",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702024',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-2",
    //     type: "other",
    //     network: "monetag",
    //     src: "https://quge5.com/88/tag.min.js",
    //     enabled: true,
    // },
    // {
    //     id: "monetag-3",
    //     type: "other",
    //     network: "monetag",
    //     src: "https://5gvci.com/act/files/tag.min.js?z=10702028",
    //     enabled: true,
    // },
    // {
    //     id: "monetag-4",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702046',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-5",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702048',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-6",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702050',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-7",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702051',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-8",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702052',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-9",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702053',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
    // {
    //     id: "monetag-10",
    //     type: "other",
    //     network: "monetag",
    //     inline: `(function(s){s.dataset.zone='10702055',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
    //     enabled: true,
    // },
];


// ─── Native Banner Ads ────────────────────────────────────────
// Script iklan native yang ditampilkan di dalam halaman (bukan popup)

export interface NativeAdConfig {
    /** ID unik */
    id: string;
    /** Label set (A, B, dll.) untuk memilih dari komponen */
    set: string;
    /** Network asal */
    network: string;
    /** URL script invoke.js */
    src: string;
    /** Container div ID yang dibutuhkan oleh script */
    containerId: string;
    /** Aktif atau tidak */
    enabled: boolean;
}

export const NATIVE_AD_CONFIGS: NativeAdConfig[] = [
    // {
    //     id: "native-adsterra-a",
    //     set: "A",
    //     network: "adsterra",
    //     src: "https://balkliving.com/1fe522e35341470390c5d22d3859e155/invoke.js",
    //     containerId: "container-1fe522e35341470390c5d22d3859e155",
    //     enabled: true,
    // },
];


// ─── Sidebar Ads (Advertica, dll) ─────────────────────────────
// Script iklan (biasanya 160x600 skyscraper) yang diletakkan di sidebar halaman

export interface SidebarAdConfig {
    id: string;
    network: string;
    insProps: {
        style?: CSSProperties;
        "data-width"?: string;
        "data-height"?: string;
        className?: string;
        "data-domain"?: string;
        "data-affquery"?: string;
    };
    scriptSrc: string;
    enabled: boolean;
}

export const SIDEBAR_AD_CONFIGS: SidebarAdConfig[] = [
    {
        id: "advertica-sidebar",
        network: "advertica",
        insProps: {
            style: { width: "160px", height: "600px", display: "inline-block" },
            "data-width": "160",
            "data-height": "600",
            className: "edde818665d",
            "data-domain": "//data527.click",
            "data-affquery": "/f364edfc2c3644ad5c79/dde818665d/?placementName=roxynime",
        },
        scriptSrc: "//data527.click/js/responsive.js",
        enabled: true,
    }
];


// ─── Helper Functions ──────────────────────────────────────────

/** Ambil semua global scripts yang aktif */
export function getEnabledGlobalScripts(): GlobalAdScript[] {
    return GLOBAL_AD_SCRIPTS.filter((s) => s.enabled);
}

/** Ambil global scripts berdasarkan tipe */
export function getGlobalScriptsByType(type: GlobalAdScript["type"]): GlobalAdScript[] {
    return GLOBAL_AD_SCRIPTS.filter((s) => s.enabled && s.type === type);
}

/** Ambil native ad config berdasarkan set */
export function getNativeAdBySet(set: string): NativeAdConfig | undefined {
    return NATIVE_AD_CONFIGS.find((n) => n.enabled && n.set === set);
}

/** Ambil semua native ads yang aktif */
export function getEnabledNativeAds(): NativeAdConfig[] {
    return NATIVE_AD_CONFIGS.filter((n) => n.enabled);
}

/** Ambil semua sidebar ads yang aktif */
export function getEnabledSidebarAds(): SidebarAdConfig[] {
    return SIDEBAR_AD_CONFIGS.filter((s) => s.enabled);
}
