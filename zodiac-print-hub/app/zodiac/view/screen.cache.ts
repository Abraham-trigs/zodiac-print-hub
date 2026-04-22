import { SCREEN_MAP, ScreenID } from "../view/screen.registry";

type CachedScreen = {
  Top: React.FC;
  Down: React.FC;
};

const screenCache = new Map<ScreenID, CachedScreen>();

export function getCachedScreen(screenId: ScreenID): CachedScreen {
  // 1. Return from cache if exists
  if (screenCache.has(screenId)) {
    return screenCache.get(screenId)!;
  }

  // 2. Resolve from Registry
  let screen = SCREEN_MAP[screenId];

  // 3. SAFE FALLBACK: If screen is missing, don't crash.
  // Redirect to WELCOME (or your main dashboard)
  if (!screen) {
    console.error(
      `🚨 Screen ID "${screenId}" not found in SCREEN_MAP. Falling back to WELCOME.`,
    );
    screen = SCREEN_MAP["WELCOME"];
  }

  const cached: CachedScreen = {
    Top: screen.TopComponent,
    Down: screen.DownComponent,
  };

  // 4. Cache it for next time
  screenCache.set(screenId, cached);

  return cached;
}
