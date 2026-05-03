"use client";

import { useZodiac } from "@store/zodiac.store";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ZodiacScreen } from "../../types/screen.types";
import { HubActionButton } from "@ui/common/HubActionButton";

// ✅ Direct Import of the Workstation (Bypassing Registry)
import { PriceCreationWorkstation } from "@/components/workstation/pricecreation/PriceCreationWorkstation";

/**
 * PRICE_ENTRY_CENTER
 * Modernized entry point utilizing the Slick Workstation pattern.
 */
export const PriceEntryCenter: ZodiacScreen = {
  id: "PRICE_ENTRY_CENTER",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { openModal, closeAll } = useModalStore(); // ✅ Added closeAll for safety

    // ✅ Extract the isolated reset action
    const resetPricingDraft = useDataStore((s) => s.resetPricingDraft);

    /**
     * TRIGGER: PRICE CREATION WORKSTATION
     * Resets the dedicated bucket and launches the tool.
     */
    const handleStartNew = () => {
      // 1. Reset the isolated pricingDraft bucket
      resetPricingDraft();

      // 2. Clear any active Top/Down/Detail modals before launching Global
      closeAll();

      // 3. Launch the Workstation DIRECTLY in the GLOBAL slot
      openModal("GLOBAL", PriceCreationWorkstation);
    };

    /**
     * NAVIGATION: PRICE LIST
     */
    const handleViewCatalog = () => {
      setScreen("PRICE_STOCK_DETAIL");
    };

    return (
      <div className="flex flex-col h-full items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        {/* --- BRANDING / CONTEXT --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Price Hub
          </h2>
          <p className="text-[8px] text-cyan-400 uppercase font-black tracking-[0.5em] mt-2">
            System Entrance
          </p>
        </div>

        {/* --- ACTION HUB --- */}
        <div className="w-full flex flex-col gap-4 max-w-sm">
          {/* PRIMARY ACTION: LAUNCH WORKSTATION (Resets Draft) */}
          <HubActionButton
            label="New Price"
            caption="Start Price/Stock Questionnaire"
            icon="➕"
            onClick={handleStartNew}
          />

          <div className="flex items-center gap-4 py-2 opacity-10">
            <div className="h-px bg-white flex-1" />
            <span className="text-[9px] font-black uppercase">OR</span>
            <div className="h-px bg-white flex-1" />
          </div>

          {/* SECONDARY ACTION: LIST NAVIGATION */}
          <HubActionButton
            variant="secondary"
            label="View Price List"
            caption="Search Database & Inventory"
            onClick={handleViewCatalog}
          />
        </div>

        {/* --- FOOTER HINT --- */}
        <p className="mt-12 text-[7px] text-white/5 uppercase font-black italic tracking-widest">
          Zodiac Management v2.0 • Secured Workflow
        </p>
      </div>
    );
  },

  DownComponent: undefined,
};
