import { ScreenID } from "../view/screen.registry";
import { getCachedScreen } from "../view/screen.cache";

class ScreenPredictor {
  private preloaded = new Set<ScreenID>();

  preload(screenId: ScreenID) {
    if (this.preloaded.has(screenId)) return;

    getCachedScreen(screenId);
    this.preloaded.add(screenId);
  }

  reset() {
    this.preloaded.clear();
  }
}

export const screenPredictor = new ScreenPredictor();
