"use client";

import { useEffect, useRef } from "react";
import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";
import { useDataStore } from "@store/core/useDataStore";
import { ZodiacScreen } from "../types/screen.types";

// ✅ UI Components
import { PriceDisplayPreview } from "./modals/PriceDisplayPreview";
import { PriceEntryStepModal } from "./modals/PriceEntryStepModal";

export const PriceCreationScreen: ZodiacScreen = {
  id: "PRICE_CREATION",
  layoutMode: "SPLIT",

  TopComponent: () => {
    const setSharedAction = useZodiac((s) => s.setSharedAction);
    const swapModal = useModalStore((s) => s.swapModal);
    const goBack = useZodiac((s) => s.goBack);

    // Using refs to prevent double-injection and closure staleness
    const injectedRef = useRef(false);

    useEffect(() => {
      if (injectedRef.current) return;
      injectedRef.current = true;

      // 1. Inject the "Receiver" (Live Preview) to the TOP zone
      swapModal("TOP", PriceDisplayPreview);

      // 2. Inject the "Taker" (Input Steps) to the DOWN zone
      swapModal("DOWN", PriceEntryStepModal);

      // 3. Set the global action button
      setSharedAction({
        label: "Create Price",
        type: "CUSTOM",
        onPress: async () => {
          // Access the latest state from the stores
          const { draftState, createPrice, setDraft, orgId } =
            useDataStore.getState();
          const { closeModal } = useModalStore.getState();

          const draft = draftState?.draft;

          // Validation check before proceeding
          if (!draft?.name || !draft?.priceGHS) {
            console.warn(
              "[PriceCreation] Validation failed: Name and Price are required.",
            );
            return;
          }

          try {
            // Trigger Service -> Coordinator -> DB logic
            await createPrice({ ...draft, orgId });

            // Cleanup & Reset UI
            setDraft(null);
            closeModal("TOP");
            closeModal("DOWN");

            // Navigate back to the previous screen (Price List)
            goBack();
          } catch (error) {
            console.error("[PriceCreation] Global Action Failed:", error);
          }
        },
      });

      return () => {
        // Cleanup on screen exit to prevent memory leaks and zombie actions
        setSharedAction(null);
        swapModal("TOP", null);
        swapModal("DOWN", null);
      };
    }, [swapModal, setSharedAction, goBack]);

    // Frame-1 Fallback for the Top Zone
    return <PriceDisplayPreview />;
  },

  // Frame-1 Fallback for the Down Zone
  DownComponent: () => <PriceEntryStepModal />,
};
