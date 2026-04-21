import { SCREEN_MAP, ScreenID } from "../view/screen.registry";

type CachedScreen = {
  Top: React.FC;
  Down: React.FC;
};

const screenCache = new Map<ScreenID, CachedScreen>();

export function getCachedScreen(screenId: ScreenID): CachedScreen {
  if (screenCache.has(screenId)) {
    return screenCache.get(screenId)!;
  }

  const screen = SCREEN_MAP[screenId];

  if (!screen) {
    throw new Error(`Screen not found: ${screenId}`);
  }

  const cached: CachedScreen = {
    Top: screen.TopComponent,
    Down: screen.DownComponent,
  };

  screenCache.set(screenId, cached);

  return cached;
}
