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
import { PriceCreationScreen } from "@/screens/PriceCatalogScreen";
import { MaterialServiceCatalog } from "@/screens/MaterialServiceCatalog";
import { UnitVaultScreen } from "@/screens/UnitVaultScreen";
import { PriceStockDetailScreen } from "@/screens/PriceStockDetailScreen";

/**
 * Central screen registry (source of truth for navigation engine)
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
  PRICE_CATALOG: PriceCreationScreen,
  MATERIAL_SERVICE_CATALOG: MaterialServiceCatalog,
  UNIT_VAULT: UnitVaultScreen,
  PRICE_STOCK_DETAIL: PriceStockDetailScreen,
} as const satisfies Record<string, ZodiacScreen>;

/**
 * Strongly typed screen IDs derived from registry
 */
export type ScreenID = keyof typeof SCREEN_MAP;

/**
 * Safe resolver (prevents undefined runtime access)
 */
export function getScreen(id: ScreenID): ZodiacScreen {
  return SCREEN_MAP[id];
}

/**
 * Optional: preload hook
 */
export function preloadScreen(id: ScreenID) {
  return SCREEN_MAP[id];
}
