"use client";

import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@store/useModalStore";
import { ClassificationHub } from "./ClassificationHub";
import { MaterialServiceCatalog } from "./MaterialServiceCatalog";
import { FolderSearch, Plus } from "lucide-react";

/**
 * QUICK_EDIT_NAME
 * The entry point for Item Identity.
 * Manages both Manual Creation and Database Resource Selection.
 */
export function QuickEditName({ current }: { current: string }) {
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const { swapModal } = useModalStore();

  /**
   * HANDLE CONFIRM
   * Logic: Sets both technical and display names.
   * Resets stockRefId to ensure a fresh resource link.
   */
  const handleConfirm = (value: string) => {
    const cleanValue = value.trim();
    if (cleanValue) {
      setPricingDraft({
        name: cleanValue,
        displayName: cleanValue,
        stockRefId: undefined,
      });
    }
    swapModal("DOWN", ClassificationHub);
  };

  const handleOpenCatalog = () => {
    // Opens the Resource Vault as a Detail Overlay
    swapModal("DETAIL", MaterialServiceCatalog);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto w-full text-center flex flex-col h-full">
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4 block">
          Item Identity
        </span>

        {/* 1. MANUAL ENTRY (NEW RESOURCE) */}
        <div className="relative group">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-center text-4xl font-black text-white outline-none py-6 border-b border-white/10 focus:border-cyan-400 transition-all placeholder:text-white/10 uppercase"
            placeholder="TYPE NAME..."
            defaultValue={current === "---" ? "" : current}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm(e.currentTarget.value);
              if (e.key === "Escape") swapModal("DOWN", ClassificationHub);
            }}
          />
          <Plus
            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 text-cyan-400"
            size={16}
          />
        </div>

        <div className="flex items-center gap-4 py-8 opacity-10">
          <div className="h-px bg-white flex-1" />
          <span className="text-[8px] font-black uppercase">
            Or Search Vault
          </span>
          <div className="h-px bg-white flex-1" />
        </div>

        {/* 2. DATABASE SELECTION (EXISTING RESOURCE) */}
        <button
          onClick={handleOpenCatalog}
          className="w-full py-5 px-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 group hover:border-cyan-400 hover:bg-cyan-400/5 transition-all active:scale-95"
        >
          <FolderSearch
            className="text-cyan-400 opacity-40 group-hover:opacity-100"
            size={24}
          />
          <div className="flex flex-col items-start text-left">
            <span className="text-[11px] font-black uppercase text-white/80 group-hover:text-white">
              Browse Resource Catalog
            </span>
            <span className="text-[6px] opacity-30 uppercase font-black tracking-widest group-hover:opacity-60">
              Link to existing Material or Service
            </span>
          </div>
        </button>

        {/* FOOTER */}
        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          <button
            onClick={() => swapModal("DOWN", ClassificationHub)}
            className="text-[10px] text-white/20 hover:text-white uppercase font-black transition-all tracking-widest"
          >
            ← Discard Changes
          </button>

          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <span className="text-[7px] font-black text-cyan-400/40 uppercase tracking-tighter">
              Enter to confirm • Esc to cancel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
