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

const LARGE_FORMAT_UNITS = new Set(["sqft", "sqm", "Per Sq Meter", "Per Yard"]);

export function JobEntryModal() {
  const [mode, setMode] = useState<EntryMode>("IDLE");
  const { setScreen } = useZodiac();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draft = useDataStore((s) => s.draftState?.draft, shallow);
  const prices = useDataStore(selectPricesMap);
  const clients = useDataStore(selectClientsMap);
  const setDraft = useDataStore((s) => s.setDraft);
  const resetDraft = useDataStore((s) => s.resetDraft);
  const total = useDataStore(selectLiveEstimate) ?? 0;

  const selectedService = draft?.serviceId
    ? prices[draft.serviceId]
    : undefined;

  const selectedClient = draft?.clientId ? clients[draft.clientId] : undefined;

  const isLargeFormat = LARGE_FORMAT_UNITS.has(selectedService?.unit ?? "");

  const navigateToServiceSearch = () => setScreen("SERVICE_SEARCH");
  const navigateToClientSearch = () => setScreen("CLIENT_SEARCH" as any);

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canEditSize = isLargeFormat && selectedService;

  return (
    <div className="flex flex-col h-full w-full p-2 overflow-hidden">
      {/* HUD */}
      <div className="flex justify-between items-center px-2 mb-3">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase opacity-40 tracking-[0.2em]">
            Estimate
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-cyan-400">₵</span>
            <span className="text-lg font-mono font-black">
              {total.toFixed(2)}
            </span>
          </div>
        </div>

        {draft?.b2bPushId && (
          <span className="text-[7px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
            B2B
          </span>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col justify-center">
        {mode === "IDLE" ? (
          <div className="flex flex-col gap-2">
            {/* SERVICE (always single gate) */}
            {!selectedService && (
              <button
                onClick={navigateToServiceSearch}
                className="w-full py-4 bg-cyan-400 text-black font-black uppercase text-[10px] rounded-xl"
              >
                Select Material
              </button>
            )}

            {selectedService && (
              <>
                {/* CLIENT (only if missing) */}
                {!selectedClient && (
                  <button
                    onClick={navigateToClientSearch}
                    className="w-full py-3 bg-emerald-500 text-black font-black uppercase text-[9px] rounded-xl"
                  >
                    Assign Customer
                  </button>
                )}

                {/* SIZE + QTY (ONLY ONE ENTRY CONTEXT ACTIVE) */}
                <div className="grid grid-cols-2 gap-1.5">
                  {canEditSize && (
                    <>
                      {!draft?.width && (
                        <button
                          onClick={() => setMode("WIDTH")}
                          className="py-2 bg-white/5 rounded-lg flex flex-col items-center"
                        >
                          <span className="text-[6px] opacity-40 uppercase">
                            Width
                          </span>
                          <span className="text-xs font-black">0ft</span>
                        </button>
                      )}

                      {!draft?.height && (
                        <button
                          onClick={() => setMode("HEIGHT")}
                          className="py-2 bg-white/5 rounded-lg flex flex-col items-center"
                        >
                          <span className="text-[6px] opacity-40 uppercase">
                            Height
                          </span>
                          <span className="text-xs font-black">0ft</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* QUANTITY always last single entry */}
                  {!draft?.quantity || mode !== "QUANTITY" ? (
                    <button
                      onClick={() => setMode("QUANTITY")}
                      className={`py-2 bg-white/5 rounded-lg flex flex-col items-center ${
                        !canEditSize ? "col-span-2" : ""
                      }`}
                    >
                      <span className="text-[6px] opacity-40 uppercase">
                        Qty
                      </span>
                      <span className="text-xs font-black">
                        {draft?.quantity ?? 1}
                      </span>
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : (
          /* INPUT MODE (ONLY ONE ACTIVE FIELD AT A TIME) */
          <div className="text-center">
            <span className="text-[7px] font-black text-cyan-400 uppercase">
              {mode}
            </span>

            <input
              autoFocus
              type="number"
              className="w-full bg-transparent text-center text-4xl font-black outline-none"
              value={
                mode === "WIDTH"
                  ? (draft?.width ?? 0)
                  : mode === "HEIGHT"
                    ? (draft?.height ?? 0)
                    : (draft?.quantity ?? 0)
              }
              onChange={(e) => {
                const value = Number(e.target.value);

                if (mode === "WIDTH") setDraft({ width: value });
                if (mode === "HEIGHT") setDraft({ height: value });
                if (mode === "QUANTITY") setDraft({ quantity: value });
              }}
              onBlur={() => setMode("IDLE")}
              onKeyDown={(e) => e.key === "Enter" && setMode("IDLE")}
            />
          </div>
        )}
      </div>

      {/* ACTION */}
      {selectedService && selectedClient && mode === "IDLE" && (
        <button
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await useDataStore
                .getState()
                .createJob({ ...draft, service: selectedService } as any);

              resetDraft();
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="mt-3 w-full py-3 bg-white text-black font-black uppercase text-[10px] rounded-xl"
        >
          Push to Production
        </button>
      )}
    </div>
  );
}
