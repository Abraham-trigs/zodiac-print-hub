"use client";

import { useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@/store/useModalStore";
import { useZodiac } from "@store/zodiac.store";
import { shallow } from "zustand/shallow";

export function ServiceEntryStepModal() {
  // STEPS: IDENTITY -> UNIT_VAULT -> PRICING
  const [step, setStep] = useState<
    "IDENTITY" | "UNIT_VAULT_TRIGGER" | "PRICING"
  >("IDENTITY");

  const { closeModal } = useModalStore();
  const { setScreen } = useZodiac();
  const draft = useDataStore((s) => s.draftState.draft, shallow);
  const setDraft = (updates: any) => useDataStore.getState().setDraft(updates);

  const handleSave = async () => {
    await useDataStore.getState().createPrice({
      ...draft,
      orgId: useDataStore.getState().orgId,
      isPhysical: false, // 🔥 Hardcoded: This is a Service
    });
    closeModal("DOWN");
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white overflow-hidden">
      <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
        <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8 block">
          SERVICE SETUP: {step}
        </span>

        {/* STEP 1: IDENTITY */}
        {step === "IDENTITY" && (
          <div className="flex flex-col gap-8 animate-in fade-in">
            <h2 className="text-2xl font-black italic text-white">
              Service Name
            </h2>
            <input
              autoFocus
              className="input-large"
              placeholder="e.g. Graphic Design / Delivery"
              value={draft?.name || ""}
              onChange={(e) => setDraft({ name: e.target.value })}
              onKeyDown={(e) =>
                e.key === "Enter" && setStep("UNIT_VAULT_TRIGGER")
              }
            />
            <button
              onClick={() => setStep("UNIT_VAULT_TRIGGER")}
              className="confirm-btn"
            >
              Next: Choose Unit →
            </button>
          </div>
        )}

        {/* STEP 2: UNIT VAULT */}
        {step === "UNIT_VAULT_TRIGGER" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny">Billing Type (Zodiac Vault)</span>
            <button
              onClick={() => setScreen("UNIT_VAULT")}
              className="py-12 border-2 border-dashed border-cyan-400/20 rounded-[3rem] text-3xl font-black text-white bg-cyan-400/5"
            >
              {draft?.unit || "CHOOSE UNIT"}
            </button>
            <button
              disabled={!draft?.unit}
              onClick={() => setStep("PRICING")}
              className="confirm-btn bg-white text-black"
            >
              Set Service Rate →
            </button>
          </div>
        )}

        {/* STEP 3: PRICING */}
        {step === "PRICING" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny text-cyan-400">
              Manual Rate (per {draft?.unit})
            </span>
            <input
              autoFocus
              type="number"
              className="input-large !text-8xl"
              placeholder="0.00"
              onChange={(e) => setDraft({ priceGHS: Number(e.target.value) })}
            />
            <button
              onClick={handleSave}
              className="confirm-btn bg-white text-black mt-4"
            >
              Create Service →
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .label-tiny {
          @apply text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 block;
        }
        .input-large {
          @apply w-full bg-transparent text-center text-5xl font-black outline-none border-b border-white/10 focus:border-cyan-400 transition-all;
        }
        .confirm-btn {
          @apply w-full py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black uppercase text-[11px] active:scale-95 transition-all;
        }
      `}</style>
    </div>
  );
}

ServiceEntryStepModal.modalId = "SERVICE_ENTRY_STEP";
