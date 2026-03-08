// Provider Registry — Central hub for all anime providers

import { AnimeProvider, ProviderInfo } from "./types";
import { otakudesuProvider } from "./otakudesu";
import { samehadakuProvider } from "./samehadaku";
import { donghuaProvider } from "./donghua";
import { anoboyProvider } from "./anoboy";
import { oploverzProvider } from "./oploverz";

// Registry of all available providers
const providers: Record<string, AnimeProvider> = {
    otakudesu: otakudesuProvider,
    samehadaku: samehadakuProvider,
    donghua: donghuaProvider,
    anoboy: anoboyProvider,
    oploverz: oploverzProvider,
};

const DEFAULT_PROVIDER = "otakudesu";

/**
 * Get a provider by its ID. Falls back to default if not found.
 */
export function getProvider(id?: string | null): AnimeProvider {
    if (!id || !providers[id]) {
        return providers[DEFAULT_PROVIDER];
    }
    return providers[id];
}

/**
 * Get the default provider
 */
export function getDefaultProvider(): AnimeProvider {
    return providers[DEFAULT_PROVIDER];
}

/**
 * Get all available providers
 */
export function getAllProviders(): AnimeProvider[] {
    return Object.values(providers);
}

/**
 * Get provider info for all registered providers
 */
export function getAllProviderInfo(): ProviderInfo[] {
    return Object.values(providers).map((p) => p.info);
}

/**
 * Check if a provider ID is valid
 */
export function isValidProvider(id: string): boolean {
    return id in providers;
}

// Re-export types for convenience
export type { AnimeProvider, ProviderInfo } from "./types";
export type {
    ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse, PaginationInfo,
} from "./types";
