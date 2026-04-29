"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { useZodiac } from "@store/zodiac.store";
import { ClassificationHub } from "../ClassificationHub";

/**
 * QUICK_EDIT_NAME
 * Integrated with a gateway to the Material/Service Catalog.
 */
export function QuickEditName({ current }: { current: string }) {
  const setDraft = useDataStore((s) => s.setDraft);
  const { swapModal } = useModalStore();
  const { setScreen } = useZodiac();

  const handleConfirm = (value: string) => {
    if (value.trim()) {
      setDraft({ name: value.trim(), stockRefId: undefined }); // Clear ID if manually typing
    }
    swapModal("DOWN", ClassificationHub);
  };

  const handleOpenCatalog = () => {
    // Navigate to the full search screen
    setScreen("MATERIAL_SERVICE_CATALOG");
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto w-full text-center flex flex-col h-full">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4 block">
          Item Identity
        </span>

        {/* 1. MANUAL ENTRY */}
        <input
          autoFocus
          type="text"
          className="w-full bg-transparent text-center text-4xl font-black text-white outline-none py-6 border-b border-white/10 focus:border-cyan-400 transition-all placeholder:text-white/10 uppercase"
          placeholder="New Name..."
          defaultValue={current === "---" ? "" : current}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm(e.currentTarget.value);
            if (e.key === "Escape") swapModal("DOWN", ClassificationHub);
          }}
        />

        <div className="flex items-center gap-4 py-6 opacity-20">
          <div className="h-px bg-white flex-1" />
          <span className="text-[8px] font-black uppercase">OR</span>
          <div className="h-px bg-white flex-1" />
        </div>

        {/* 2. DATABASE SELECTION */}
        <button
          onClick={handleOpenCatalog}
          className="w-full py-5 px-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center gap-3 group hover:border-cyan-400 transition-all active:scale-95"
        >
          <span className="text-xl">🗂️</span>
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black uppercase text-white/80 group-hover:text-cyan-400">
              Select From Database
            </span>
            <span className="text-[6px] opacity-30 uppercase font-black tracking-widest">
              Existing Materials & Services
            </span>
          </div>
        </button>

        {/* FOOTER */}
        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          <button
            onClick={() => swapModal("DOWN", ClassificationHub)}
            className="text-[10px] text-white/20 hover:text-white uppercase font-black transition-all"
          >
            ← Cancel
          </button>

          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <span className="text-[7px] font-black text-cyan-400/40 uppercase tracking-tighter">
              Type to create new • Click folder to find existing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
