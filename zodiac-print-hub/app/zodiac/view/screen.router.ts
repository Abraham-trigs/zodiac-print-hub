import { ScreenID, SCREEN_MAP } from "../view/screen.registry";

/**
 * Converts internal screen state → URL path
 * Ensures we stay within the /zodiac base route
 */
export function screenToPath(screenId: ScreenID): string {
  // If it's the home screen, just return the base path
  if (screenId === "WELCOME") return "/zodiac";

  return `/zodiac/${screenId.toLowerCase()}`;
}

/**
 * Converts URL path → internal screen state
 * Handles /zodiac, /zodiac/hub_menu, etc.
 */
export function pathToScreen(path: string): ScreenID {
  // 1. Clean the path and get segments
  const segments = path.split("/").filter(Boolean);

  // 2. Get the last segment (e.g., "job_intake")
  const lastSegment = segments[segments.length - 1]?.toUpperCase();

  // 3. Fallback logic: If path is empty, just "zodiac", or invalid
  if (
    !lastSegment ||
    lastSegment === "ZODIAC" ||
    !(lastSegment in SCREEN_MAP)
  ) {
    return "WELCOME";
  }

  return lastSegment as ScreenID;
}
