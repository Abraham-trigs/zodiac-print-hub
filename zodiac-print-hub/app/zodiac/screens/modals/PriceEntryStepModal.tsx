"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@/store/useModalStore";
import { useZodiac } from "@store/zodiac.store";

// ✅ CRITICAL: Import the actual Components to avoid the "casing" error
import { MaterialEntryStepModal } from "./MaterialEntryStepModal";
import { ServiceEntryStepModal } from "./ServiceEntryStepModal";

/**
 * PRICE_ENTRY_STEP_MODAL (The Classification Hub)
 *
 * STEP 1 & 2: Identifies if the user wants an existing item,
 * a new Physical Joinery (Material), or a Laaaabor entry (Service).
 */
export function PriceEntryStepModal() {
  const { swapModal } = useModalStore();
  const { setScreen } = useZodiac();
  const setDraft = useDataStore((s) => s.setDraft);

  /* =========================================================
     PATHWAY ROUTING
  ========================================================= */

  // PATH 3a: Select Existing Material
  const handleSelectExisting = () => {
    // Navigates to the full-screen Material Catalog (Zodiac Screen)
    setScreen("MATERIAL_SERVICE_CATALOG");
  };

  // PATH 3b: Create New Material (Full 5-Step Joinery)
  const handleCreateNewMaterial = () => {
    // Initialize the draft as physical so the Joinery logic triggers
    setDraft({
      isPhysical: true,
      name: "",
      unit: "",
      width: 0,
      height: 0,
      quantity: 0,
    });

    // 🔥 FIX: Pass the PascalCase Component directly to solve the Casing Error
    swapModal("DOWN", MaterialEntryStepModal);
  };

  // PATH: Create New Service (3-Step Labor Only)
  const handleCreateService = () => {
    // Initialize as non-physical to skip anchors and costing steps
    setDraft({
      isPhysical: false,
      name: "",
      unit: "",
      width: 0,
      height: 0,
      quantity: 0,
    });

    // 🔥 FIX: Pass the PascalCase Component directly
    swapModal("DOWN", ServiceEntryStepModal);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white overflow-hidden">
      <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-black italic mb-2 tracking-tighter">
          PRICE LIST
        </h2>
        <p className="text-[8px] text-white/20 uppercase font-black tracking-[0.4em] mb-10">
          Step 1 & 2: Classification Hub
        </p>

        <div className="flex flex-col gap-3">
          {/* OPTION: EXISTING (Step 3a) */}
          <button
            onClick={handleSelectExisting}
            className="p-8 border border-white/10 bg-white/5 rounded-[2.5rem] flex flex-col items-center gap-2 group hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
          >
            <span className="text-sm font-black uppercase group-hover:text-cyan-400 transition-colors">
              Select Existing
            </span>
            <span className="text-[7px] opacity-20 uppercase font-black tracking-widest">
              Pull from Database
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* OPTION: NEW MATERIAL (Step 3b) */}
            <button
              onClick={handleCreateNewMaterial}
              className="p-8 border border-white/10 bg-white/5 rounded-[2.5rem] flex flex-col items-center gap-2 group hover:border-emerald-400 hover:bg-emerald-400/5 transition-all active:scale-95"
            >
              <span className="text-[10px] font-black uppercase group-hover:text-emerald-400 transition-colors">
                + Material
              </span>
              <span className="text-[6px] opacity-20 uppercase font-black">
                Physical Joinery
              </span>
            </button>

            {/* OPTION: NEW SERVICE */}
            <button
              onClick={handleCreateService}
              className="p-8 border border-white/10 bg-white/5 rounded-[2.5rem] flex flex-col items-center gap-2 group hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
            >
              <span className="text-[10px] font-black uppercase group-hover:text-cyan-400 transition-colors">
                + Service
              </span>
              <span className="text-[6px] opacity-20 uppercase font-black">
                Labor Only
              </span>
            </button>
          </div>
        </div>

        <p className="mt-10 text-[7px] text-white/10 uppercase font-black italic tracking-widest animate-pulse">
          Pick a path to start the questionnaire
        </p>
      </div>
    </div>
  );
}

// Keep the string ID only for the store's reference, not for rendering
PriceEntryStepModal.modalId = "PRICE_ENTRY_STEP";
