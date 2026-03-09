/**
 * ═══════════════════════════════════════════════
 *   RoxyNime — Ad Network Configuration
 * ═══════════════════════════════════════════════
 *
 *  Supported Networks: Adsterra, ExoClick, PropellerAds, HilltopAds
 *
 *  HOW TO ADD YOUR AD CODES:
 *  1. Paste your ad code/key in the appropriate section below
 *  2. Set enabled: true for the network you want active
 *  3. Deploy — ads will auto-rotate between enabled networks
 *
 *  Each ad placement will randomly pick from ALL enabled networks
 *  for maximum revenue optimization.
 */

// ─── Types ───────────────────────────────────────────────

export type AdNetwork = "adsterra" | "exoclick" | "propellerads" | "hilltopads";

export interface AdUnit {
    /** Unique identifier for this ad unit */
    id: string;
    /** Which network this belongs to */
    network: AdNetwork;
    /** Ad format/size label */
    format: string;
    /** Width in pixels */
    width: number;
    /** Height in pixels */
    height: number;
    /** The ad key, zone ID, or placement ID from the network */
    key: string;
    /** Script URL (if the network uses a script tag) */
    scriptUrl?: string;
}

export interface NetworkConfig {
    /** Enable/disable this entire network */
    enabled: boolean;
    /** Display name */
    name: string;
    /** Banner ads (leaderboard, mobile banners, etc.) */
    banners: AdUnit[];
    /** Rectangle ads (300x250, in-feed) */
    rectangles: AdUnit[];
    /** Native/small ads (320x50, etc.) */
    natives: AdUnit[];
    /** Popunder script URL (if available) */
    popunder?: string;
    /** Interstitial ad units */
    interstitials: AdUnit[];
}

// ─── CONFIGURATION ────────────────────────────────────────
//
//  ✏️  EDIT BELOW — Paste your ad codes from each network
//

/** 
 * Verification Meta Tags
 * Add tags here to verify your site ownership for ad networks (monetag, etc.) 
 */
export const VERIFICATION_META_TAGS = [
    { name: "monetag", content: "f7741fca031b06265f52e59195616470" },
    { name: "a3976e5839396e4d0b02dfeb5a15e654c02367dc", content: "a3976e5839396e4d0b02dfeb5a15e654c02367dc" },
    { name: "monetag", content: "11bb69bb4d641d9b94b196ab5d84532c" },
    { name: "3375b985ef300c04e1dc3bc53816b6b18f34e207", content: "3375b985ef300c04e1dc3bc53816b6b18f34e207" },
];

export const ADS_CONFIG: Record<AdNetwork, NetworkConfig> = {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ADSTERRA — https://www.adsterra.com
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    adsterra: {
        enabled: true,
        name: "Adsterra",
        banners: [
            {
                id: "adsterra-banner-1",
                network: "adsterra",
                format: "728x90",
                width: 728,
                height: 90,
                key: "1d4f1463e95b8d3fb84adadeb3a2f170",
                // Script URL auto-generated: https://www.highperformanceformat.com/{key}/invoke.js
            },
            {
                id: "adsterra-banner-2",
                network: "adsterra",
                format: "728x90",
                width: 728,
                height: 90,
                key: "c89ece9ff04cd88930d8cf0f5e62f70f",
            },
        ],
        rectangles: [
            // Paste your 300x250 keys here:
            // {
            //     id: "adsterra-rect-1",
            //     network: "adsterra",
            //     format: "300x250",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_ADSTERRA_300x250_KEY",
            // },
        ],
        natives: [
            // Paste your native/320x50 keys here:
            // {
            //     id: "adsterra-native-1",
            //     network: "adsterra",
            //     format: "320x50",
            //     width: 320,
            //     height: 50,
            //     key: "YOUR_ADSTERRA_NATIVE_KEY",
            // },
        ],
        popunder: "//pl28650799.effectivegatecpm.com/a2/92/18/a29218ac83917d59f19c700bc4e955f0.js",
        interstitials: [],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  EXOCLICK — https://www.exoclick.com
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    exoclick: {
        enabled: false, // ← Set to true after adding your zone IDs
        name: "ExoClick",
        banners: [
            // ExoClick uses Zone IDs. Paste yours here:
            // {
            //     id: "exo-banner-1",
            //     network: "exoclick",
            //     format: "728x90",
            //     width: 728,
            //     height: 90,
            //     key: "YOUR_EXOCLICK_ZONE_ID",
            //     scriptUrl: "https://a.magsrv.com/ad-provider.js",
            // },
        ],
        rectangles: [
            // {
            //     id: "exo-rect-1",
            //     network: "exoclick",
            //     format: "300x250",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_EXOCLICK_ZONE_ID",
            //     scriptUrl: "https://a.magsrv.com/ad-provider.js",
            // },
        ],
        natives: [
            // {
            //     id: "exo-native-1",
            //     network: "exoclick",
            //     format: "native",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_EXOCLICK_NATIVE_ZONE_ID",
            //     scriptUrl: "https://a.magsrv.com/ad-provider.js",
            // },
        ],
        // ExoClick Popunder:
        // popunder: "https://a.magsrv.com/ad-provider.js",
        interstitials: [
            // {
            //     id: "exo-interstitial-1",
            //     network: "exoclick",
            //     format: "interstitial",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_EXOCLICK_INTERSTITIAL_ZONE_ID",
            //     scriptUrl: "https://a.magsrv.com/ad-provider.js",
            // },
        ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  PROPELLERADS — https://www.propellerads.com
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    propellerads: {
        enabled: false, // ← Set to true after adding your zone IDs
        name: "PropellerAds",
        banners: [
            // PropellerAds uses Zone IDs with their own script
            // {
            //     id: "propeller-banner-1",
            //     network: "propellerads",
            //     format: "728x90",
            //     width: 728,
            //     height: 90,
            //     key: "YOUR_PROPELLERADS_ZONE_ID",
            //     scriptUrl: "//pl_________.profitablegatecpm.com/YOUR_HASH.js",
            // },
        ],
        rectangles: [
            // {
            //     id: "propeller-rect-1",
            //     network: "propellerads",
            //     format: "300x250",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_PROPELLERADS_ZONE_ID",
            //     scriptUrl: "//pl_________.profitablegatecpm.com/YOUR_HASH.js",
            // },
        ],
        natives: [
            // {
            //     id: "propeller-native-1",
            //     network: "propellerads",
            //     format: "native",
            //     width: 320,
            //     height: 50,
            //     key: "YOUR_PROPELLERADS_NATIVE_ID",
            //     scriptUrl: "//pl_________.profitablegatecpm.com/YOUR_HASH.js",
            // },
        ],
        // PropellerAds Popunder/OnClick:
        // popunder: "//pl_________.profitablegatecpm.com/YOUR_POPUNDER_HASH.js",
        interstitials: [
            // {
            //     id: "propeller-interstitial-1",
            //     network: "propellerads",
            //     format: "interstitial",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_PROPELLERADS_INTERSTITIAL_ID",
            //     scriptUrl: "//pl_________.profitablegatecpm.com/YOUR_HASH.js",
            // },
        ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  HILLTOPADS — https://www.hilltopads.com
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    hilltopads: {
        enabled: false, // ← Set to true after adding your zone IDs
        name: "HilltopAds",
        banners: [
            // HilltopAds uses Zone IDs with iframe embeds
            // {
            //     id: "hilltop-banner-1",
            //     network: "hilltopads",
            //     format: "728x90",
            //     width: 728,
            //     height: 90,
            //     key: "YOUR_HILLTOPADS_ZONE_ID",
            //     scriptUrl: "https://www.hilltopads.net/hta/afu.php",
            // },
        ],
        rectangles: [
            // {
            //     id: "hilltop-rect-1",
            //     network: "hilltopads",
            //     format: "300x250",
            //     width: 300,
            //     height: 250,
            //     key: "YOUR_HILLTOPADS_ZONE_ID",
            //     scriptUrl: "https://www.hilltopads.net/hta/afu.php",
            // },
        ],
        natives: [],
        // HilltopAds Popunder:
        // popunder: "https://www.hilltopads.net/hta/afu.php?zoneid=YOUR_POPUNDER_ZONE&var=YOUR_VAR",
        interstitials: [],
    },
};

// ─── Helper Functions ──────────────────────────────────────

/** Get all enabled networks */
export function getEnabledNetworks(): NetworkConfig[] {
    return Object.values(ADS_CONFIG).filter((n) => n.enabled);
}

/** Get all banner ad units from enabled networks */
export function getBannerAds(): AdUnit[] {
    return getEnabledNetworks().flatMap((n) => n.banners);
}

/** Get all rectangle ad units from enabled networks */
export function getRectangleAds(): AdUnit[] {
    return getEnabledNetworks().flatMap((n) => n.rectangles);
}

/** Get all native ad units from enabled networks */
export function getNativeAds(): AdUnit[] {
    return getEnabledNetworks().flatMap((n) => n.natives);
}

/** Get all interstitial ad units from enabled networks */
export function getInterstitialAds(): AdUnit[] {
    return getEnabledNetworks().flatMap((n) => n.interstitials);
}

/** Get all popunder scripts from enabled networks */
export function getPopunderScripts(): string[] {
    return getEnabledNetworks()
        .map((n) => n.popunder)
        .filter((s): s is string => !!s);
}

/**
 * Pick a random ad unit from a list.
 * Uses a slot string for deterministic (but distributed) selection.
 */
export function pickAd(ads: AdUnit[], slot: string = "default"): AdUnit | null {
    if (ads.length === 0) return null;
    const hash = slot.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return ads[hash % ads.length];
}

/**
 * Pick a random ad unit of any type from enabled networks.
 * Falls back through: preferred → banners → any.
 */
export function pickAdForSlot(
    type: "banner" | "rectangle" | "native" | "interstitial",
    slot: string = "default"
): AdUnit | null {
    const getters: Record<string, () => AdUnit[]> = {
        banner: getBannerAds,
        rectangle: getRectangleAds,
        native: getNativeAds,
        interstitial: getInterstitialAds,
    };

    // FIXED: Hanya return ad dari tipe yang diminta, TIDAK fallback ke tipe lain
    // Fallback ke banner/any menyebabkan NativeAd/InFeedAd render iframe ukuran salah → kotak putih
    const ads = getters[type]();
    if (ads.length > 0) return pickAd(ads, slot);

    // Tidak ada ad untuk tipe ini → return null → komponen tidak render apa-apa
    return null;
}

// ─── Script Generators (per network) ────────────────────────

/**
 * Generate the iframe srcDoc for a given ad unit.
 * Each network has its own script injection pattern.
 */
export function generateAdSrcDoc(ad: AdUnit, overrideW?: number, overrideH?: number): string {
    const w = overrideW || ad.width;
    const h = overrideH || ad.height;

    switch (ad.network) {
        case "adsterra":
            return `<html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:${h}px;overflow:hidden;background:transparent;">
                <script type="text/javascript">
                    atOptions = { 'key':'${ad.key}', 'format':'iframe', 'height':${h}, 'width':${w}, 'params':{} };
                </script>
                <script type="text/javascript" src="https://www.highperformanceformat.com/${ad.key}/invoke.js"></script>
            </body></html>`;

        case "exoclick":
            return `<html><head>
                <script type="text/javascript" src="${ad.scriptUrl || 'https://a.magsrv.com/ad-provider.js'}" async></script>
            </head><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:${h}px;overflow:hidden;background:transparent;">
                <ins class="eas6a97888e" data-zoneid="${ad.key}"></ins>
                <script>(AdProvider = window.AdProvider || []).push({"serve": {}});</script>
            </body></html>`;

        case "propellerads":
            return `<html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:${h}px;overflow:hidden;background:transparent;">
                <script type="text/javascript" src="${ad.scriptUrl}" async></script>
            </body></html>`;

        case "hilltopads":
            // HilltopAds uses iframe embed or script
            const htaUrl = `${ad.scriptUrl || 'https://www.hilltopads.net/hta/afu.php'}?zoneid=${ad.key}&var=${w}x${h}`;
            return `<html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:${h}px;overflow:hidden;background:transparent;">
                <iframe src="${htaUrl}" width="${w}" height="${h}" frameborder="0" scrolling="no" style="border:none;"></iframe>
            </body></html>`;

        default:
            return `<html><body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:${h}px;background:transparent;">
                <div style="width:${w}px;height:${h}px;background:#1a1a2e;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#666;font-size:11px;">Ad</div>
            </body></html>`;
    }
}
