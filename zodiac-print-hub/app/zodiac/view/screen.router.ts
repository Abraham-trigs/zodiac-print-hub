import { ScreenID } from "../view/screen.registry";

/**
 * Converts internal screen state → URL path
 */
export function screenToPath(screenId: ScreenID): string {
  return `/${screenId.toLowerCase()}`;
}

/**
 * Converts URL path → internal screen state
 */
export function pathToScreen(path: string): ScreenID {
  const normalized = path.replace("/", "").toUpperCase();

  return normalized as ScreenID;
}
