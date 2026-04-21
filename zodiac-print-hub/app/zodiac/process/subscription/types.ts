/**
 * =========================
 * ENGINE LAYER (FLOW CONTROL)
 * =========================
 */

export type ProcessActionType = "next" | "back" | "cancel";

// 🔥 UPDATED: Added 'PLANS' to the Step IDs
export type SubscriptionStepId = "IDENTITY" | "LOCATION" | "PLANS" | "STOCK";

/**
 * Single step definition (workflow engine)
 */
export interface StepBlueprint {
  id: SubscriptionStepId;
  actions: ProcessActionType[];
  onEnter?: () => void;
  onExit?: () => void;
  canProceed?: (data: SubscriptionData) => boolean;
}

/**
 * =========================
 * UI LAYER (DISPLAY ONLY)
 * =========================
 */

export interface SubscriptionStep {
  id: SubscriptionStepId;
  label: string;
}

/**
 * =========================
 * DOMAIN MODEL (SOURCE OF TRUTH)
 * =========================
 */

export interface SubscriptionData {
  name?: string;
  logoUrl?: string;
  digitalAddress?: string;
  locationUrl?: string;

  // 🔥 UPDATED: Added planId to track the selected subscription tier
  planId?: "FREE" | "DOMINATE" | "GROW";

  stocks?: Array<{
    itemName: string;
    quantity: number;
    unit: string;
  }>;
}
