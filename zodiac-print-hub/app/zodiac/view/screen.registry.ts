import { WelcomeScreen } from "@screens/WelcomeScreen";
import { UserProfileScreen } from "@screens/UserProfileScreen";
import { SubscriptionScreen } from "@screens/subscription/SubscriptionScreen";
import { JobCartScreen } from "@screens/JobCartScreen";
import { AnalyticsDashboard } from "@screens/AnalyticsDashboard";
import { HubMenuScreen } from "@screens/HubMenuScreen";
import { StaffManagementScreen } from "@screens/StaffManagementScreen";
import { StaffProfileScreen } from "@screens/StaffProfileScreen";
import { JobIntakeScreen } from "@screens/JobIntakeScreen";
import { ZodiacScreen } from "@types/screen.types";
import { ServiceSearchScreen } from "@screens/ServiceSearchScreen";
import { ClientSearchScreen } from "@screens/ClientSearchScreen";
import { UnitVaultScreen } from "@screens/UnitVaultScreen";
import { PriceStockDetailScreen } from "@screens/PriceStockDetailScreen";
import { PriceEntryCenter } from "@screens/PriceEntryCenter";

// 🛰️ Procurement & Supply Chain Node
import { SupplierRegistryScreen } from "@workstation/inventory/components/SupplierRegistryScreen";
import { SupplierDetailScreen } from "@screens/SupplierDetailScreen";
import { SupplyNodeScreen } from "@workstation/inventory/components/SupplyNodeScreen";
import { ReceivingNodeScreen } from "@workstation/inventory/components/ReceivingNode";
import { SupplierPortalDashboard } from "@screens/SupplierPortalDashboard";

// 🏆 Performance & Oversight
import { StaffOversightScreen } from "@screens/StaffOversightScreen";

// 💎 Finance & Logistics Node (🚀 NEW)
import { FinanceIntelligenceHub } from "@screens/FinanceIntelligenceHub";
import { FrontDeskClearance } from "@modals/FrontDeskClearance";
import { DispatchBoard } from "@screens/DispatchBoard";
import { RiderDispatchMobile } from "@screens/RiderDispatchMobile";
import { RiderRemittanceReport } from "@screens/RiderRemittanceReport";
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

  // 🛰️ Procurement & Supply Chain
  SUPPLIER_REGISTRY: SupplierRegistryScreen,
  SUPPLIER_DETAIL: SupplierDetailScreen,
  SUPPLY_NODE: SupplyNodeScreen,
  RECEIVING_NODE: ReceivingNodeScreen,
  SUPPLIER_PORTAL: SupplierPortalDashboard,

  // 💎 Finance Hub
  FINANCE_HUB: FinanceIntelligenceHub,

  // 🛵 Logistics & Fleet Node
  FRONT_DESK_CLEARANCE: FrontDeskClearance,
  DISPATCH_BOARD: DispatchBoard,
  RIDER_MOBILE: RiderDispatchMobile,
  RIDER_REMITTANCE: RiderRemittanceReport,
} as const satisfies Record<string, ZodiacScreen>;

export type ScreenID = keyof typeof SCREEN_MAP;

export function getScreen(id: ScreenID): ZodiacScreen {
  return SCREEN_MAP[id];
}

export function preloadScreen(id: ScreenID) {
  return SCREEN_MAP[id];
}
