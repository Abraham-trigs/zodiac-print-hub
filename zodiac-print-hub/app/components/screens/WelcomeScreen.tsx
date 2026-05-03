"use client";

import { useEffect, useRef } from "react";
import { useZodiac } from "../../store/zodiac.store";
import { useModalStore } from "../../store/useModalStore";

// Components
import { WelcomeTopModal } from "../modals/WelcomeTopModal";
import { WelcomeAdModal } from "../modals/WelcomeAdModal";
import { LoginOptionsModal } from "../modals/LoginOptionsModal";

export const WelcomeScreen = {
  id: "WELCOME",
  layoutMode: "SPLIT",

  TopComponent: () => {
    const setSharedAction = useZodiac((s) => s.setSharedAction);
    const swapModal = useModalStore((s) => s.swapModal);
    const injectedRef = useRef(false);

    useEffect(() => {
      if (injectedRef.current) return;
      injectedRef.current = true;

      swapModal("TOP", WelcomeTopModal);
      swapModal("DOWN", WelcomeAdModal);

      setSharedAction({
        label: "Login to Profile",
        onPress: () => swapModal("DOWN", LoginOptionsModal),
      });

      return () => {
        setSharedAction(null);
        // Clean up store when leaving Welcome
        swapModal("TOP", null);
        swapModal("DOWN", null);
      };
    }, [swapModal, setSharedAction]);

    // 💡 FIX: Return the component directly here as a fallback
    // so the Shell has something to paint on frame 1.
    return <WelcomeTopModal />;
  },

  DownComponent: () => <WelcomeAdModal />, // 💡 FIX: Default this here too
};
