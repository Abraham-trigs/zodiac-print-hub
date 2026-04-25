"use client";

import { useEffect, useRef } from "react";
import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";

// ✅ Following the exact component import/naming style
import { PriceDisplayPreview } from "./modals/PriceDisplayPreview";
import { PriceEntryStepModal } from "./modals/PriceEntryStepModal";

export const PriceCreationScreen: ZodiacScreen = {
  id: "PRICE_CREATION",
  layoutMode: "SPLIT",

  TopComponent: () => {
    const setSharedAction = useZodiac((s) => s.setSharedAction);
    const swapModal = useModalStore((s) => s.swapModal);
    const injectedRef = useRef(false);

    useEffect(() => {
      // Prevent double-injection on re-renders (Exactly like Job screen)
      if (injectedRef.current) return;
      injectedRef.current = true;

      // 1. Inject the "Receiver" to the TOP zone
      swapModal("TOP", PriceDisplayPreview);

      // 2. Inject the "Taker" to the DOWN zone
      swapModal("DOWN", PriceEntryStepModal);

      // 3. Set the global action button (Forward-moving style)
      setSharedAction({
        label: "Create Price",
        type: "CUSTOM",
        onPress: () => {
          // Logic for finalizing the price creation goes here
          console.log("Finalizing Price Creation...");
        },
      });

      return () => {
        // Cleanup on screen exit
        setSharedAction(null);
        swapModal("TOP", null);
        swapModal("DOWN", null);
      };
    }, [swapModal, setSharedAction]);

    // Frame-1 Fallback for the Top Zone
    return <PriceDisplayPreview />;
  },

  // Frame-1 Fallback for the Down Zone
  DownComponent: () => <PriceEntryStepModal />,
};
