"use client";

import { useEffect, useRef } from "react";
import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";

// ✅ Newly created components for the Intake Flow
import { JobDisplayModal } from "./modals/MaterialDraftCard";
import { JobEntryModal } from "./modals/JobEntryModal";

export const JobIntakeScreen = {
  id: "JOB_INTAKE",
  layoutMode: "SPLIT",

  TopComponent: () => {
    const setSharedAction = useZodiac((s) => s.setSharedAction);
    const swapModal = useModalStore((s) => s.swapModal);
    const injectedRef = useRef(false);

    useEffect(() => {
      // Prevent double-injection on re-renders
      if (injectedRef.current) return;
      injectedRef.current = true;

      // 1. Inject the "Receiver" (The Receipt/Display) to the TOP zone
      swapModal("TOP", JobDisplayModal);

      // 2. Inject the "Taker" (The Instruction/Entry) to the DOWN zone
      swapModal("DOWN", JobEntryModal);

      // 3. Set the global action button for the Shell
      setSharedAction({
        label: "Push to Production",
        type: "CUSTOM",
        onPress: () => {
          // Logic for finalizing the intake goes here
          console.log("Pushing Draft to Production...");
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
    return <JobDisplayModal />;
  },

  // Frame-1 Fallback for the Down Zone
  DownComponent: () => <JobEntryModal />,
};
