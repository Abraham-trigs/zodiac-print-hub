"use client";

import { apiClient } from "@root/lib/api/client";
import { useDataStore } from "@store/core/useDataStore";
import type { PriceItem } from "@/types/zodiac.types";

/**
 * =========================================================
 * PRICING BOOTSTRAP SERVICE (HYDRATION ONLY)
 * =========================================================
 *
 * Responsibility:
 * - Fetch server state
 * - Hydrate Zustand store
 * - NO mutations
 * - NO business logic
 * - NO repository access
 *
 * This is NOT a service layer. It's a sync adapter.
 */

class PricingBootstrapService {
  /**
   * Load all prices into the client store
   */
  async loadPrices(orgId: string): Promise<PriceItem[]> {
    const res = await apiClient<{ data: { items: PriceItem[] } }>(
      "/api/prices",
      {
        query: { orgId },
      },
    );

    const items = res?.data?.items ?? [];

    useDataStore.getState().setPrices(items);

    return items;
  }

  /**
   * Optional: full system hydration (future-safe)
   * - can be expanded to include stock, jobs, clients
   */
  async bootstrap(orgId: string) {
    const prices = await this.loadPrices(orgId);

    return {
      prices,
    };
  }

  /**
   * Soft refresh (re-sync prices only)
   */
  async refreshPrices(orgId: string) {
    return this.loadPrices(orgId);
  }
}

/* ---------------- SINGLETON EXPORT ---------------- */

export const pricingBootstrapService = new PricingBootstrapService();
