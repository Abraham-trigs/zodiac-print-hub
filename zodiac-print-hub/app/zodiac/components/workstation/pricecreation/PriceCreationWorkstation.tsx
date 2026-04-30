"use client";

import { useModalStore } from "@/store/useModalStore";
import { PriceDisplayPreview } from "./components/PriceDisplayPreview";
import { ClassificationHub } from "./components/ClassificationHub";

/**
 * PRICE_CREATION_WORKSTATION
 * A dedicated UI Wrapper that manages TOP, DOWN, and DETAIL layers internally.
 */
export function PriceCreationWorkstation() {
  const { activeDetailComponent: DetailView, activeDownComponent: DownModal } =
    useModalStore();

  // Determine if we are in "Full Detail Mode"
  const isDetailMode = !!DetailView;

  return (
    <div className="workstation-shell animate-in fade-in duration-500 bg-black">
      {/* 1. BACKGROUND LAYERS (Top & Down) */}
      {/* We keep them mounted but dim them/scale them back when Detail is active */}
      <div
        className={`flex flex-col h-full transition-all duration-500 ${isDetailMode ? "opacity-20 scale-95 blur-sm pointer-events-none" : "opacity-100 scale-100"}`}
      >
        {/* TOP ZONE: The Preview Card */}
        <section className="ws-top flex-none">
          <div className="modal-box ws-container">
            <PriceDisplayPreview />
          </div>
        </section>

        {/* DOWN ZONE: The Action Hub OR Quick-Edit Modals */}
        <section className="ws-down flex-1">
          <div className="modal-box shadow-2xl overflow-hidden bg-white/5 border border-white/5">
            {/* 
               If a DownModal exists (Quick Edit), show it. 
               Otherwise, show the main Classification Hub. 
            */}
            {DownModal ? <DownModal /> : <ClassificationHub />}
          </div>
        </section>
      </div>

      {/* 2. DETAIL OVERLAY (Catalog/Vault) */}
      {/* This layer takes priority and covers the entire workstation workspace */}
      {isDetailMode && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md animate-in slide-in-from-bottom duration-500">
          <div className="h-full w-full">
            <DetailView />
          </div>
        </div>
      )}
    </div>
  );
}
