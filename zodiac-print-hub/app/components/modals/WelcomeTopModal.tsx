"use client";

import { useZodiac } from "../../store/zodiac.store";
import { ButtonAction } from "../store/zodiac.store";

export function WelcomeTopModal() {
  const setSharedAction = useZodiac((s) => s.setSharedAction);

  const goToProfile = () => {
    // 1. Trigger the immediate screen transition
    useZodiac.getState().setScreen("USER_PROFILE");

    // 2. Optional: Clear the footer action if it was set
    setSharedAction(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      {/* Logo */}
      <div className="w-32 h-32 rounded-full bg-blue-900 border-2 border-white/20 flex items-center justify-center shadow-2xl">
        <span className="text-cyan-400 font-bold text-xl">ZODIAC</span>
      </div>

      {/* Slogan */}
      <p className="text-center text-lg font-medium leading-tight">
        Print Anywhere, At anytime & Lead
      </p>

      {/* ACTION BUTTON */}
      <button
        onClick={goToProfile}
        className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-semibold active:scale-95 transition"
      >
        Open Profile
      </button>
    </div>
  );
}

WelcomeTopModal.modalId = "WELCOME_TOP";
