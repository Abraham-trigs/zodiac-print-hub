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

// 🚀 NEW: Supply Chain Node Screens
import { SupplierRegistryScreen } from "../screens/procurement/SupplierRegistryScreen";
import { SupplierDetailScreen } from "../screens/procurement/SupplierDetailScreen";
import { SupplyNodeScreen } from "../screens/procurement/SupplyNodeScreen";
import { ReceivingNodeScreen } from "../screens/procurement/ReceivingNodeScreen";
import { SupplierPortalDashboard } from "../screens/portal/SupplierPortalDashboard";

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

  // 🛰️ Procurement & Logistics Node
  SUPPLIER_REGISTRY: SupplierRegistryScreen, // Phase 1: Vault
  SUPPLIER_DETAIL: SupplierDetailScreen, // Phase 1: Identity & Materials
  SUPPLY_NODE: SupplyNodeScreen, // Phase 2: Shortfalls
  RECEIVING_NODE: ReceivingNodeScreen, // Phase 3: Check-in
  SUPPLIER_PORTAL: SupplierPortalDashboard,
} as const satisfies Record<string, ZodiacScreen>;

export type ScreenID = keyof typeof SCREEN_MAP;

export function getScreen(id: ScreenID): ZodiacScreen {
  return SCREEN_MAP[id];
}

export function preloadScreen(id: ScreenID) {
  return SCREEN_MAP[id];
}
