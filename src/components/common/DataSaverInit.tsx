"use client";
import { useEffect } from "react";
import { useDataSaver } from "@/context/DataSaverContext";

export function DataSaverInit() {
    const { isHemat } = useDataSaver();

    useEffect(() => {
        const styleId = "roxynime-saver-styles";
        let el = document.getElementById(styleId) as HTMLStyleElement | null;

        if (isHemat) {
            // Inject CSS global mode hemat
            if (!el) {
                el = document.createElement("style");
                el.id = styleId;
                document.head.appendChild(el);
            }
            el.textContent = `
        /* ── RoxyNime Ultra Hemat Mode ── */

        /* 1. Matikan SEMUA animasi dan transisi */
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }

        /* 2. Matikan backdrop-blur (GPU boros) */
        .backdrop-blur-sm, .backdrop-blur,
        .backdrop-blur-md, .backdrop-blur-lg,
        .backdrop-blur-xl, .backdrop-blur-2xl,
        .backdrop-blur-3xl {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        /* 3. Matikan gradient backgrounds */
        .bg-gradient-to-r, .bg-gradient-to-l,
        .bg-gradient-to-b, .bg-gradient-to-t,
        .bg-gradient-to-br, .bg-gradient-to-bl {
          background-image: none !important;
        }

        /* 4. Matikan box-shadow */
        .shadow, .shadow-sm, .shadow-md,
        .shadow-lg, .shadow-xl, .shadow-2xl {
          box-shadow: none !important;
        }

        /* 5. Paksa system font (hemat ~150KB Google Fonts) */
        * {
          font-family: -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, Arial, sans-serif !important;
        }

        /* 6. Sembunyikan semua gambar dekoratif */
        img[data-decorative="true"],
        .hero-bg-image,
        .anime-bg-blur {
          display: none !important;
        }

        /* 7. Matikan custom scrollbar (hemat render) */
        * {
          scrollbar-width: thin !important;
        }
      `;

            // Matikan prefetch semua link
            document.querySelectorAll<HTMLLinkElement>(
                "link[rel='prefetch'], link[rel='preload'][as='font']"
            ).forEach((el) => el.remove());

        } else {
            // Mode normal: hapus CSS hemat
            el?.remove();
        }
    }, [isHemat]);

    return null;
}
