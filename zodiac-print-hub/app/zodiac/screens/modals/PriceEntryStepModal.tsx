"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@/store/useModalStore";
import { useZodiac } from "@store/zodiac.store";

// ✅ UI Components
import { MaterialEntryStepModal } from "./MaterialEntryStepModal";
import { ServiceEntryStepModal } from "./ServiceEntryStepModal";

/**
 * PRICE_ENTRY_STEP_MODAL (The Classification Hub)
 * Refactored to show:
 * 1. Select Existing
 * 2. New (Header) -> Material || Service
 */
export function PriceEntryStepModal() {
  const { swapModal } = useModalStore();
  const { setScreen } = useZodiac();
  const setDraft = useDataStore((s) => s.setDraft);

  /* =========================================================
     PATHWAY ROUTING
  ========================================================= */

  const handleSelectExisting = () => {
    setScreen("MATERIAL_SERVICE_CATALOG");
  };

  const handleCreateNewMaterial = () => {
    setDraft({
      isPhysical: true,
      name: "",
      unit: "",
      width: 0,
      height: 0,
      quantity: 0,
    });
    swapModal("DOWN", MaterialEntryStepModal);
  };

  const handleCreateService = () => {
    setDraft({
      isPhysical: false,
      name: "",
      unit: "",
      width: 0,
      height: 0,
      quantity: 0,
    });
    swapModal("DOWN", ServiceEntryStepModal);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 text-white overflow-hidden">
      <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-black italic mb-1 tracking-tighter">
          PRICE LIST
        </h2>
        <p className="text-[7px] text-white/20 uppercase font-black tracking-[0.4em] mb-4">
          Step 1 & 2: Classification Hub
        </p>

        <div className="flex flex-col gap-4">
          {/* 1. SELECT EXISTING */}
          <button
            onClick={handleSelectExisting}
            className="p-5 border border-white/10 bg-white/5 rounded-[2rem] flex flex-col items-center gap-1 group hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
          >
            <span className="text-xs font-black uppercase group-hover:text-cyan-400 transition-colors">
              Select Existing Material or Service
            </span>
            <span className="text-[6px] opacity-20 uppercase font-black tracking-widest">
              Pull from Database
            </span>
          </button>

          {/* 2. NEW SECTION HEADER */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
              — Create New —
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* 3. MATERIAL || SERVICE BUTTONS */}
              <button
                onClick={handleCreateNewMaterial}
                className="p-5 border border-white/10 bg-white/5 rounded-[2rem] flex flex-col items-center gap-1 group hover:border-emerald-400 hover:bg-emerald-400/5 transition-all active:scale-95"
              >
                <span className="text-[10px] font-black uppercase group-hover:text-emerald-400 transition-colors">
                  Material base Price
                </span>
                <span className="text-[5px] opacity-20 uppercase font-black">
                  Physical Joinery
                </span>
              </button>

              <button
                onClick={handleCreateService}
                className="p-5 border border-white/10 bg-white/5 rounded-[2rem] flex flex-col items-center gap-1 group hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
              >
                <span className="text-[10px] font-black uppercase group-hover:text-cyan-400 transition-colors">
                  Service Base
                </span>
                <span className="text-[5px] opacity-20 uppercase font-black">
                  Labor Only
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[6px] text-white/10 uppercase font-black italic tracking-widest animate-pulse">
          Pick a path to start the questionnaire
        </p>
      </div>
    </div>
  );
}

PriceEntryStepModal.modalId = "PRICE_ENTRY_STEP";
