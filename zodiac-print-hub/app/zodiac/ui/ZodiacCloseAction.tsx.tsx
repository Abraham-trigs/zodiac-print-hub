// app/zodiac/ui/ZodiacCloseAction.tsx
"use client";

import { useModalStore } from "@store/useModalStore";
import { useZodiac } from "@store/zodiac.store";

interface CloseProps {
  mode?: "AUTO" | "MODAL_ONLY" | "SCREEN_ONLY";
  className?: string;
}

/**
 * ZODIAC UNIVERSAL CLOSE ACTION
 * Integrated with ModalState slots (TOP, DOWN, DETAIL, GLOBAL)
 */
export function ZodiacCloseAction({ mode = "AUTO", className }: CloseProps) {
  const modalStore = useModalStore();
  const { goBack } = useZodiac();

  const handleClose = () => {
    // 1. MODAL PRIORITY: Check occupied slots in order of UI depth
    if (mode === "AUTO" || mode === "MODAL_ONLY") {
      // Global usually sits on top of everything
      if (modalStore.activeGlobalComponent)
        return modalStore.closeModal("GLOBAL");

      // Detail or Side panels
      if (modalStore.activeDetailComponent)
        return modalStore.closeModal("DETAIL");

      // Overlays (Top/Down)
      if (modalStore.activeDownComponent) return modalStore.closeModal("DOWN");
      if (modalStore.activeTopComponent) return modalStore.closeModal("TOP");
    }

    // 2. NAVIGATION FALLBACK: If no active modal components, pop the screen stack
    if (mode === "AUTO" || mode === "SCREEN_ONLY") {
      goBack();
    }
  };

  return (
    <button
      onClick={handleClose}
      className={
        className ||
        `
        w-10 h-10 rounded-full bg-white/5 border border-white/10 
        flex items-center justify-center text-white/20 
        hover:text-red-400 hover:border-red-500/50 
        transition-all active:scale-90
      `
      }
    >
      <span className="text-xs">✕</span>
    </button>
  );
}
