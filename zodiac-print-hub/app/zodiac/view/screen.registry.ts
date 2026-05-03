import { WelcomeScreen } from "../../components/screens/WelcomeScreen";
import { UserProfileScreen } from "../../components/screens/UserProfileScreen";
import { SubscriptionScreen } from "../../components/screens/subscription/SubscriptionScreen";
import { JobCartScreen } from "../../components/screens/JobCartScreen";
import { AnalyticsDashboard } from "../../components/screens/AnalyticsDashboard";
import { HubMenuScreen } from "../../components/screens/HubMenuScreen";
import { StaffManagementScreen } from "../../components/screens/StaffManagementScreen";
import { StaffProfileScreen } from "../../components/screens/StaffProfileScreen";
import { JobIntakeScreen } from "../../components/screens/JobIntakeScreen";
import { ZodiacScreen } from "../types/screen.types";
import { ServiceSearchScreen } from "../../components/screens/ServiceSearchScreen";
import { ClientSearchScreen } from "../../components/screens/ClientSearchScreen";
import { UnitVaultScreen } from "../../components/screens/UnitVaultScreen";
import { PriceStockDetailScreen } from "../../components/screens/PriceStockDetailScreen";
import { PriceEntryCenter } from "../../components/screens/PriceEntryCenter";

// 🚀 NEW: Supply Chain Node Screens
import { SupplierRegistryScreen } from "../../components/screens/procurement/SupplierRegistryScreen";
import { SupplierDetailScreen } from "../../components/screens/procurement/SupplierDetailScreen";
import { SupplyNodeScreen } from "../../components/screens/procurement/SupplyNodeScreen";
import { ReceivingNodeScreen } from "../../components/screens/procurement/ReceivingNodeScreen";
import { SupplierPortalDashboard } from "../../components/screens/portal/SupplierPortalDashboard";
import { StaffOversightScreen } from "@root/components/screens/StaffOversightScreen";
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
  STAFF_OVERSIGHT: StaffOversightScreen,

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
