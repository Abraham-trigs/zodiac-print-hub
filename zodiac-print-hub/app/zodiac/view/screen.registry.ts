import { WelcomeScreen } from "../screens/WelcomeScreen";
import { UserProfileScreen } from "../screens/UserProfileScreen";
import { SubscriptionScreen } from "../screens/subscription/SubscriptionScreen";
import { JobCartScreen } from "../screens/JobCartScreen";
import { AnalyticsDashboard } from "../screens/AnalyticsDashboard";
import { HubMenuScreen } from "../screens/HubMenuScreen";
import { StaffManagementScreen } from "../screens/StaffManagementScreen";
import { StaffProfileScreen } from "../screens/StaffProfileScreen";
import { JobIntakeScreen } from "../screens/JobIntakeScreen";
import { ZodiacScreen } from "../types/screen.types";
import { ServiceSearchScreen } from "../screens/ServiceSearchScreen";
import { ClientSearchScreen } from "../screens/ClientSearchScreen";
import { UnitVaultScreen } from "../screens/UnitVaultScreen";
import { PriceStockDetailScreen } from "../screens/PriceStockDetailScreen";
import { PriceEntryCenter } from "../screens/PriceEntryCenter";

/**
 * Central screen registry
 * Cleaned of workstation components to prevent circular dependency loops.
 */
export const SCREEN_MAP = {
  WELCOME: WelcomeScreen,
  USER_PROFILE: UserProfileScreen,
  SUBSCRIPTION: SubscriptionScreen,
  JOB_CART: JobCartScreen,
  ANALYTICS: AnalyticsDashboard,
  HUB_MENU: HubMenuScreen,
  STAFF_MGMT: StaffManagementScreen,
  STAFF_PROFILE: StaffProfileScreen,
  JOB_INTAKE: JobIntakeScreen,
  SERVICE_SEARCH: ServiceSearchScreen,
  CLIENT_SEARCH: ClientSearchScreen,
  UNIT_VAULT: UnitVaultScreen,
  PRICE_STOCK_DETAIL: PriceStockDetailScreen,
  PRICE_ENTRY_CENTER: PriceEntryCenter,
} as const satisfies Record<string, ZodiacScreen>;

export type ScreenID = keyof typeof SCREEN_MAP;

export function getScreen(id: ScreenID): ZodiacScreen {
  return SCREEN_MAP[id];
}

export function preloadScreen(id: ScreenID) {
  return SCREEN_MAP[id];
}
