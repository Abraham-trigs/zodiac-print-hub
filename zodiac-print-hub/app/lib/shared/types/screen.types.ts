import { ViewMode } from "../../../store/zodiac.store";
import { ScreenID } from "../../../zodiac/view/screen.registry";

/**
 * Defines navigation + action behavior for a screen
 */
export interface ScreenAction {
  label: string;
  nextScreenId?: ScreenID;
  nextViewMode?: ViewMode;
  onPress?: () => void;
}

/**
 * Full lifecycle-aware screen contract
 * (This is now part of your UI engine, not just React config)
 */
export interface ZodiacScreen {
  id: ScreenID;
  layoutMode: ViewMode;

  // ---------------- UI LAYERS ----------------
  TopComponent: React.FC;
  DownComponent?: React.FC;

  // ---------------- ACTIONS ----------------
  primaryAction?: ScreenAction;

  // ---------------- LIFECYCLE HOOKS ----------------
  /**
   * Called when screen becomes active
   */
  onEnter?: () => void;

  /**
   * Called before screen is removed
   * (useful for cleanup, modal reset, saving state)
   */
  onExit?: () => void;

  /**
   * Optional: runs once when screen is first registered/loaded
   * (useful for prefetching data or lazy initialization)
   */
  onInit?: () => void;
}
