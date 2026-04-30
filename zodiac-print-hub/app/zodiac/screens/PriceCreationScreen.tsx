"use client";

import { useEffect } from "react";
import { useModalStore } from "@/store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";

// ✅ Updated imports to match our new file names
import { PriceDisplayPreview } from "../components/workstation/pricecreation/components/PriceDisplayPreview";
import { ClassificationHub } from "../components/workstation/pricecreation/components/ClassificationHub";

/**
 * PRICE_CREATION_SCREEN
 * The "Main Stage" for the new entry experience.
 * Orchestrates the TOP and DOWN modal zones.
 */
export const PriceCreationScreen: ZodiacScreen = {
  id: "PRICE_CREATION",
  layoutMode: "SPLIT", // Enables dual-zone view (Top Summary + Bottom Action Hub)

  TopComponent: () => {
    const { swapModal } = useModalStore();

    useEffect(() => {
      // 1. Mount the interactive Live Preview to the TOP zone
      swapModal("TOP", PriceDisplayPreview);

      // 2. Mount the main Action Hub to the DOWN zone
      swapModal("DOWN", ClassificationHub);

      // Optional: Logic to clear zones on unmount could be added here if needed
    }, [swapModal]);

    return null; // UI is rendered via the modal zones in the Shell
  },

  DownComponent: undefined,
};
