import { SCREEN_MAP, ScreenID } from "../view/screen.registry";

/**
 * CACHED_SCREEN TYPE
 * Aligned with ZodiacScreen interface (TopComponent / DownComponent)
 */
type CachedScreen = {
  TopComponent: React.FC;
  DownComponent?: React.FC; // Made optional to match registry
};

const screenCache = new Map<ScreenID, CachedScreen>();

export function getCachedScreen(screenId: ScreenID): CachedScreen {
  // 1. Return from cache if exists
  if (screenCache.has(screenId)) {
    return screenCache.get(screenId)!;
  }

  // 2. Resolve from Registry
  let screen = SCREEN_MAP[screenId];

  // 3. SAFE FALLBACK
  if (!screen) {
    console.error(
      `🚨 Screen ID "${screenId}" not found in SCREEN_MAP. Falling back to WELCOME.`,
    );
    screen = SCREEN_MAP["WELCOME"];
  }

  // 4. ALIGNED MAPPING
  // We keep the original names so the Shell knows what it's looking at
  const cached: CachedScreen = {
    TopComponent: screen.TopComponent,
    DownComponent: screen.DownComponent,
  };

  // 5. Cache it for next time
  screenCache.set(screenId, cached);

  return cached;
}
