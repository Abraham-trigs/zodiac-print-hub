"use client";

import { useState } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "../../store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import {
  selectPricesMap,
  selectLiveEstimate,
  selectClientsMap,
} from "../../store/selectors/data.selectors";

type EntryMode = "IDLE" | "WIDTH" | "HEIGHT" | "QUANTITY";

/**
 * JOB_ENTRY_MODAL (V2)
 * Fully aligned with PriceList Junction & Production Calculator logic.
 */
export function JobEntryModal() {
  const [mode, setMode] = useState<EntryMode>("IDLE");
  const { setScreen } = useZodiac();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DATA SOURCE ---
  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const prices = useDataStore(selectPricesMap); // Records of PriceListFull
  const clients = useDataStore(selectClientsMap);
  const { setDraft, resetDraft, createJob } = useDataStore();

  // Real-time pricing from the store's selector (Uses ProductionCalculator)
  const total = useDataStore(selectLiveEstimate) ?? 0;

  // 🔥 ALIGNMENT: Resolve the master PriceList item
  const selectedPriceItem = draft?.priceListId
    ? prices[draft.priceListId]
    : undefined;

  const selectedClient = draft?.clientId ? clients[draft.clientId] : undefined;

  // 🔥 THE PRODUCTION LOGIC: Toggle UI fields based on the "Recipe" rules
  const isDimensional =
    selectedPriceItem?.material?.calcType === "DIMENSIONAL" ||
    selectedPriceItem?.service?.calcType === "AREA_BASED";

  const isLinear = selectedPriceItem?.material?.calcType === "LINEAR";

  const navigateToServiceSearch = () => setScreen("SERVICE_SEARCH");
  const navigateToClientSearch = () => setScreen("CLIENT_SEARCH" as any);

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-2 overflow-hidden">
      {/* 1. FINANCIAL HUD */}
      <div className="flex justify-between items-center px-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase opacity-40 tracking-[0.2em]">
            Estimate Total
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-cyan-400">₵</span>
            <span className="text-xl font-mono font-black">
              {total.toFixed(2)}
            </span>
          </div>
        </div>
        {draft?.b2bPushId && (
          <span className="text-[7px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-black">
            B2B SOURCE
          </span>
        )}
      </div>

      {/* 2. MAIN INPUT AREA */}
      <div className="flex-1 flex flex-col justify-center">
        {mode === "IDLE" ? (
          <div className="flex flex-col gap-2">
            {!selectedPriceItem ? (
              <button
                onClick={navigateToServiceSearch}
                className="w-full py-4 bg-cyan-400 text-black font-black uppercase text-[10px] rounded-xl shadow-lg active:scale-95 transition-all"
              >
                Select Product / Material
              </button>
            ) : (
              <>
                {!selectedClient && (
                  <button
                    onClick={navigateToClientSearch}
                    className="w-full py-3 bg-emerald-500 text-black font-black uppercase text-[9px] rounded-xl active:scale-95 transition-all"
                  >
                    Assign Customer
                  </button>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  {/* DIMENSIONAL UI (Width & Height) */}
                  {isDimensional && (
                    <>
                      <button
                        onClick={() => setMode("WIDTH")}
                        className="py-3 bg-white/5 rounded-lg flex flex-col items-center hover:bg-white/10"
                      >
                        <span className="text-[6px] opacity-40 uppercase">
                          Width
                        </span>
                        <span className="text-sm font-black">
                          {draft?.width ?? 0}
                          {selectedPriceItem?.material?.unit ?? "ft"}
                        </span>
                      </button>

                      <button
                        onClick={() => setMode("HEIGHT")}
                        className="py-3 bg-white/5 rounded-lg flex flex-col items-center hover:bg-white/10"
                      >
                        <span className="text-[6px] opacity-40 uppercase">
                          Height
                        </span>
                        <span className="text-sm font-black">
                          {draft?.height ?? 0}
                          {selectedPriceItem?.material?.unit ?? "ft"}
                        </span>
                      </button>
                    </>
                  )}

                  {/* LINEAR UI (Length Only) */}
                  {isLinear && (
                    <button
                      onClick={() => setMode("WIDTH")}
                      className="col-span-2 py-3 bg-white/5 rounded-lg flex flex-col items-center"
                    >
                      <span className="text-[6px] opacity-40 uppercase">
                        Length
                      </span>
                      <span className="text-sm font-black">
                        {draft?.width ?? 0}
                        {selectedPriceItem?.material?.unit ?? "ft"}
                      </span>
                    </button>
                  )}

                  {/* QUANTITY (Standard) */}
                  <button
                    onClick={() => setMode("QUANTITY")}
                    className={`py-3 bg-white/5 rounded-lg flex flex-col items-center ${!isDimensional && !isLinear ? "col-span-2" : ""}`}
                  >
                    <span className="text-[6px] opacity-40 uppercase">
                      Quantity
                    </span>
                    <span className="text-sm font-black">
                      {draft?.quantity ?? 1}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* 3. ACTIVE INPUT MODE */
          <div className="text-center animate-in zoom-in-95 duration-200">
            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">
              {mode}
            </span>
            <input
              autoFocus
              type="number"
              className="w-full bg-transparent text-center text-5xl font-black outline-none text-white selection:bg-cyan-400/30"
              value={
                mode === "WIDTH"
                  ? (draft?.width ?? "")
                  : mode === "HEIGHT"
                    ? (draft?.height ?? "")
                    : (draft?.quantity ?? "")
              }
              onChange={(e) => {
                const val = Number(e.target.value);
                if (mode === "WIDTH") setDraft({ width: val });
                if (mode === "HEIGHT") setDraft({ height: val });
                if (mode === "QUANTITY") setDraft({ quantity: val });
              }}
              onBlur={() => setMode("IDLE")}
              onKeyDown={(e) => e.key === "Enter" && setMode("IDLE")}
            />
          </div>
        )}
      </div>

      {/* 4. PRODUCTION PUSH */}
      {selectedPriceItem && selectedClient && mode === "IDLE" && (
        <button
          onClick={async () => {
            setIsSubmitting(true);
            try {
              // 🚀 PUSH: Uses priceListId to trigger the Junction Logic in the backend
              await createJob({ ...draft, priceListId: selectedPriceItem.id });
              resetDraft();
              setScreen("IDLE");
            } catch (err) {
              console.error("Job Push Error:", err);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="mt-3 w-full py-4 bg-white text-black font-black uppercase text-[10px] rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-cyan-400 transition-all active:scale-95"
        >
          Push to Production →
        </button>
      )}
    </div>
  );
}
