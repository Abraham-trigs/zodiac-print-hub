// app/components/modals/MaterialEntryStepModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@/store/useModalStore";
import { shallow } from "zustand/shallow";
import { MeasurementCalculator } from "@lib/utils/measurement-calculator";
import { UnitVaultScreen } from "@screens/UnitVaultScreen"; // Import for openModal

type MaterialStep =
  | "IDENTITY"
  | "UNIT_VAULT_GATE"
  | "MEASUREMENT"
  | "BUYING_PRICE"
  | "PRICING";

export function MaterialEntryStepModal() {
  const [step, setStep] = useState<MaterialStep>("IDENTITY");
  const { closeModal, openModal } = useModalStore();
  const draft = useDataStore((s) => s.draftState.draft, shallow);
  const setDraft = (updates: any) => useDataStore.getState().setDraft(updates);

  // 🔥 PERSISTENCE: Resume step after returning from Vault
  useEffect(() => {
    if (draft?.activeStep) {
      setStep(draft.activeStep);
      setDraft({ activeStep: null });
    }
  }, [draft?.activeStep]);

  const unitCategory = useMemo(
    () => MeasurementCalculator.getCategory(draft?.unit as any),
    [draft?.unit],
  );
  const needsDimensions =
    unitCategory === "DIMENSION" || unitCategory === "AREA";

  const handleOpenVault = (currentStep: MaterialStep) => {
    setDraft({ activeStep: currentStep });
    // 🔥 FIX: Open as GLOBAL modal so THIS modal stays mounted in the background
    openModal("GLOBAL", UnitVaultScreen.TopComponent);
  };

  const handleSave = async () => {
    await useDataStore.getState().createPrice({
      ...draft,
      orgId: useDataStore.getState().orgId,
      isPhysical: true,
    });
    closeModal("DOWN");
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white overflow-hidden">
      <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
        <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-8 block">
          JOINERY: {step.replace("_", " ")}
        </span>

        {step === "IDENTITY" && (
          <div className="flex flex-col gap-8 animate-in fade-in">
            <span className="label-tiny">Step 1: Material Identity</span>
            <input
              autoFocus
              className="input-large"
              placeholder="e.g. Vinyl Matte"
              value={draft?.name || ""}
              onChange={(e) => setDraft({ name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && setStep("UNIT_VAULT_GATE")}
            />
            <button
              onClick={() => setStep("UNIT_VAULT_GATE")}
              className="confirm-btn"
            >
              Next Step →
            </button>
          </div>
        )}

        {step === "UNIT_VAULT_GATE" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny">Step 2: Measurement Basis</span>
            <button
              onClick={() => handleOpenVault("UNIT_VAULT_GATE")}
              className="py-12 border-2 border-dashed border-cyan-400/20 rounded-[3rem] text-3xl font-black text-white bg-cyan-400/5 hover:border-cyan-400/50 transition-all"
            >
              {draft?.unit || "CHOOSE UNIT"}
            </button>
            <button
              disabled={!draft?.unit}
              onClick={() =>
                needsDimensions
                  ? setStep("MEASUREMENT")
                  : setStep("BUYING_PRICE")
              }
              className="confirm-btn bg-white text-black"
            >
              Confirm & Continue →
            </button>
          </div>
        )}

        {step === "MEASUREMENT" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny">
              Step 3: Physical Size ({draft?.unit})
            </span>
            <div className="flex gap-6 items-center justify-center">
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black opacity-20 uppercase">
                  Width
                </span>
                <input
                  type="number"
                  className="input-anchor"
                  value={draft?.width || ""}
                  onChange={(e) => setDraft({ width: Number(e.target.value) })}
                />
              </div>
              <span className="opacity-10 text-4xl mt-6">×</span>
              <div className="flex flex-col gap-2">
                <span className="text-[8px] font-black opacity-20 uppercase">
                  Height
                </span>
                <input
                  type="number"
                  className="input-anchor"
                  value={draft?.height || ""}
                  onChange={(e) => setDraft({ height: Number(e.target.value) })}
                />
              </div>
            </div>
            <button
              onClick={() => setStep("BUYING_PRICE")}
              className="confirm-btn"
            >
              Confirm Dimensions →
            </button>
          </div>
        )}

        {step === "BUYING_PRICE" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny">Step 4: Purchase Price</span>
            <input
              autoFocus
              type="number"
              className="input-large !text-7xl"
              placeholder="0.00"
              value={draft?.costPrice || ""}
              onChange={(e) => setDraft({ costPrice: Number(e.target.value) })}
            />
            <button onClick={() => setStep("PRICING")} className="confirm-btn">
              Confirm Buying Price →
            </button>
          </div>
        )}

        {step === "PRICING" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right">
            <span className="label-tiny text-cyan-400">
              Step 5: Final Selling Rate (per {draft?.unit})
            </span>
            <input
              autoFocus
              type="number"
              className="input-large !text-8xl"
              placeholder="0.00"
              value={draft?.priceGHS || ""}
              onChange={(e) => setDraft({ priceGHS: Number(e.target.value) })}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              onClick={handleSave}
              className="confirm-btn bg-cyan-400 text-black"
            >
              Finalize & Separate →
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
        .input-anchor {
          @apply w-32 bg-transparent text-center text-4xl font-black outline-none border-b border-white/5 focus:border-cyan-400 transition-all;
        }
        .confirm-btn {
          @apply w-full py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white font-black uppercase text-[11px] active:scale-95 transition-all disabled:opacity-10;
        }
      `}</style>
    </div>
  );
}
MaterialEntryStepModal.modalId = "MATERIAL_ENTRY_STEP";
