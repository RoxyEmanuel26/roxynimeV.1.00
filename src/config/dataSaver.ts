// ============================================================
// MODE HEMAT DATA — RoxyNime
// ============================================================
export const SAVER_CONFIG = {
    MODE_HEMAT: false,

    // ── LAYER 1: Media (paling boros) ──────────────
    DISABLE_IMAGES: true,          // thumbnail anime → teks
    DISABLE_BG_IMAGES: true,       // background images
    DISABLE_VIDEO_PLAYER: true,    // video streaming
    DISABLE_HERO_IMAGE: true,      // hero section image
    DISABLE_AVATAR_IMAGES: true,   // foto profil user
    DISABLE_POSTER_IMAGES: true,   // poster detail anime
    DISABLE_BANNER_IMAGES: true,   // banner promosi
    DISABLE_GENRE_IMAGES: true,    // gambar kategori genre

    // ── LAYER 2: API & Network ──────────────────────
    DISABLE_API_FETCH: true,       // semua fetch anime
    DISABLE_SEARCH_API: true,      // search live API
    DISABLE_DETAIL_API: true,      // detail anime API
    DISABLE_EPISODE_API: true,     // list episode API
    DISABLE_STREAMING_API: true,   // streaming server API
    DISABLE_PREFETCH: true,        // Next.js link prefetch
    DISABLE_PRELOAD: true,         // resource preload
    DISABLE_WEBSOCKET: true,       // realtime connections

    // ── LAYER 3: Fonts & Assets ─────────────────────
    DISABLE_GOOGLE_FONTS: true,    // Google Fonts → system font
    DISABLE_ICON_ANIMATIONS: true, // animasi lucide icons
    DISABLE_CUSTOM_SCROLLBAR: true,// custom scrollbar CSS
    USE_SYSTEM_FONT: true,         // paksa system font stack

    // ── LAYER 4: Animasi & Visual ───────────────────
    DISABLE_ANIMATIONS: true,      // semua transition/animate-*
    DISABLE_BLUR_EFFECTS: true,    // backdrop-blur (GPU intensive)
    DISABLE_GRADIENTS: true,       // gradient background
    DISABLE_SHADOWS: true,         // box-shadow & drop-shadow
    DISABLE_HOVER_EFFECTS: true,   // hover scale/glow effects
    REDUCE_TRANSPARENCY: true,     // kurangi opacity layers

    // ── LAYER 5: JavaScript Behavior ────────────────
    DISABLE_INFINITE_SCROLL: true, // infinite scroll → pagination biasa
    DISABLE_AUTO_PLAY: true,       // autoplay video/trailer
    DISABLE_LAZY_HYDRATION: false, // JANGAN disable (butuh untuk React)
    LIMIT_CARDS_PER_PAGE: 12,      // max 12 kartu per halaman (hemat render)
    DISABLE_CAROUSEL: true,        // carousel/slider → list statis
    DISABLE_TOAST_ANIMATIONS: true,// animasi notifikasi

    // ── LAYER 6: Third-party ────────────────────────
    DISABLE_ANALYTICS: true,       // matikan tracking analytics
    DISABLE_HOTJAR: true,          // matikan heatmap tools
    DISABLE_SENTRY: true,          // matikan error monitoring

    // ── IKLAN SELALU ON (tidak bisa dimatikan) ──────
    ADS_ALWAYS_ON: true,           // ← JANGAN UBAH

    // Estimasi penghematan per kategori (dalam KB)
    SAVINGS_ESTIMATE: {
        images: 1200,      // ~1.2 MB per halaman
        api: 300,          // ~300 KB
        fonts: 150,        // ~150 KB
        animations: 50,    // ~50 KB (GPU memory)
        analytics: 80,     // ~80 KB
        total: 1780,       // ~1.78 MB total per halaman
    },

    MESSAGES: {
        api_blocked: "⚡ Mode Hemat aktif — API dimatikan",
        image_blocked: "🖼️",
        video_blocked: "▶️ Video dimatikan",
        welcome: "⚡ Mode Ultra Hemat aktif",
        savings: "Menghemat ~1.8 MB per halaman",
    },
} as const;

export function isFeatureEnabled(
    feature: keyof typeof SAVER_CONFIG
): boolean {
    if (!SAVER_CONFIG.MODE_HEMAT) return true;
    return !(SAVER_CONFIG as any)[feature];
}

export function isModeHemat(): boolean {
    return SAVER_CONFIG.MODE_HEMAT;
}
