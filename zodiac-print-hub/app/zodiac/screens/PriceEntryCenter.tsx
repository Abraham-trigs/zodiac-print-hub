"use client";

import { useZodiac } from "@store/zodiac.store";
import { useDataStore } from "@store/core/useDataStore";
import { ZodiacScreen } from "../types/screen.types";
import { HubActionButton } from "@ui/common/HubActionButton"; // Verify this path matches your file structure

/**
 * PRICE_ENTRY_CENTER
 * The modernized entry point for Price and Stock management.
 */
export const PriceEntryCenter: ZodiacScreen = {
  id: "PRICE_ENTRY_CENTER",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { setScreen } = useZodiac();
    const setDraft = useDataStore((s) => s.setDraft);

    /**
     * INITIALIZE NEW FLOW
     * Prepares the global state and navigates to the dual-zone creation hub.
     */
    const handleStartNew = () => {
      // 1. Reset draft state to ensure no leftover data
      setDraft({
        name: "",
        unit: "sqft",
        costPrice: 0,
        priceGHS: 0,
        width: 0,
        height: 0,
        isPhysical: true,
      });

      // 2. Navigate to the specialized Creation Hub
      setScreen("PRICE_CREATION");
    };

    /**
     * VIEW EXISTING DATA
     * Navigates to the comprehensive price and stock list.
     */
    const handleViewCatalog = () => {
      setScreen("PRICE_STOCK_DETAIL");
    };

    return (
      <div className="flex flex-col h-full items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        {/* --- BRANDING / CONTEXT --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter text-white">
            PRICE LIST
          </h2>
          <p className="text-[8px] text-cyan-400 uppercase font-black tracking-[0.5em] mt-2">
            Management & Entry
          </p>
        </div>

        {/* --- ACTION HUB --- */}
        <div className="w-full flex flex-col gap-4 max-w-sm">
          {/* PRIMARY ACTION: CREATION */}
          <HubActionButton
            label="New Price"
            caption="Start Price/Stock Questionnaire"
            icon="➕"
            onClick={handleStartNew}
          />

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">
              OR
            </span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {/* SECONDARY ACTION: VIEWING */}
          <HubActionButton
            variant="secondary"
            label="View Price List"
            caption="Search Database & Inventory"
            onClick={handleViewCatalog}
          />
        </div>

        {/* --- FOOTER HINT --- */}
        <p className="mt-12 text-[7px] text-white/10 uppercase font-black italic tracking-widest animate-pulse">
          Secure Cloud Database • Real-time Sync
        </p>
      </div>
    );
  },

  DownComponent: undefined,
};
