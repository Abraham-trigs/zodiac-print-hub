"use client";

import { useModalStore } from "@store/useModalStore";
import { useDataStore } from "@store/core/useDataStore";
import { MaterialServiceCatalog } from "./MaterialServiceCatalog";
import { WorkstationStatus } from "../../../common/WorkstationStatus";
import { shallow } from "zustand/shallow";

export function ClassificationHub() {
  const { swapModal, closeModal } = useModalStore();

  const draft = useDataStore((s) => s.pricingDraft, shallow);

  const mode = useDataStore((s) => s.mode);
  const type = useDataStore((s) => s.type);

  const setMode = useDataStore((s) => s.setMode);
  const setType = useDataStore((s) => s.setType);
  const setPricingDraft = useDataStore((s) => s.setPricingDraft);
  const resetPricingDraft = useDataStore((s) => s.resetPricingDraft);

  const createPrice = useDataStore((s) => s.createPrice);
  const isSubmitting = useDataStore((s) => s.priceState.isSubmitting);

  const hasExistingProgress = draft?.name !== "" || (draft?.priceGHS ?? 0) > 0;

  const isIdle = mode === "idle";
  const isSubmittingState = mode === "submitting";

  const handleStartNew = () => {
    resetPricingDraft();
    setMode("idle");
    setType(null);
  };

  const handleTypeSwitch = (nextType: "material" | "service") => {
    setType(nextType); // internally sets mode -> creating (per store design)
    setMode("draft");
  };

  const handleOpenCatalog = () => swapModal("DETAIL", MaterialServiceCatalog);

  const handleExit = () => closeModal("GLOBAL");

  const triggerStatus = (
    title: string,
    message: string,
    type: "success" | "error" | "warning",
  ) => {
    swapModal("DETAIL", WorkstationStatus, { title, message, type });
  };

  const handleFinalize = async () => {
    setMode("submitting");

    if (!draft.name || draft.name === "---") {
      setMode("draft");
      return triggerStatus(
        "Identity Missing",
        "Please provide a name.",
        "warning",
      );
    }

    if (draft.priceGHS <= 0) {
      setMode("draft");
      return triggerStatus(
        "Rate Required",
        "Selling rate must be > 0.",
        "warning",
      );
    }

    if (!draft.unit) {
      setMode("draft");
      return triggerStatus(
        "Unit Missing",
        "Measurement basis required.",
        "warning",
      );
    }

    try {
      await createPrice({
        name: draft.name,
        priceGHS: draft.priceGHS,
        unit: draft.unit as any,
        category: draft.category || "General",
        isPhysical: type === "material",
        stockRefId: draft.stockRefId,
        unitCost: draft.costPrice,
        width: draft.width,
        height: draft.height,
      });

      setMode("review");

      swapModal("DETAIL", WorkstationStatus, {
        title: "Success",
        message: `${draft.name} is now live.`,
        type: "success",
      });

      setTimeout(() => {
        resetPricingDraft();
        setMode("idle");
        setType(null);
        handleExit();
      }, 2000);
    } catch (err: any) {
      setMode("draft");
      triggerStatus("Sync Error", err?.message || "Failed to save.", "error");
    }
  };

  const hasType = type !== null;

  return (
    <div className="inner-ui-content inner-ui-down modalOpen h-full flex flex-col text-center px-4">
      {/* HEADER */}
      <div className="mt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white leading-none">
          {hasType
            ? type === "material"
              ? "MATERIAL PATH"
              : "SERVICE PATH"
            : "CLASSIFICATION"}
        </h2>

        <p className="text-[6px] text-cyan-400 uppercase font-black tracking-[0.3em] mt-2 mb-6">
          {hasType ? "Complete the preview card above" : "Define Entry Path"}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* RESUME */}
        {!hasType && hasExistingProgress && (
          <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-white/5 rounded-3xl border border-white/10">
            <button
              onClick={handleStartNew}
              className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase text-white/40 active:scale-95"
            >
              Start New
            </button>

            <button
              onClick={() => handleTypeSwitch(type ?? "material")}
              className="py-4 bg-cyan-400 border border-cyan-400 rounded-2xl text-[8px] font-black uppercase text-black shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-pulse"
            >
              Resume Draft
            </button>
          </div>
        )}

        {!hasType ? (
          <>
            <button
              onClick={handleOpenCatalog}
              className="glass-card w-full py-4 px-6 flex justify-between items-center"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Select Existing
              </span>
              <span className="opacity-40 text-[10px]">🔍</span>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleTypeSwitch("material")}
                className="py-5 border border-white/10 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase"
              >
                Material
              </button>

              <button
                onClick={() => handleTypeSwitch("service")}
                className="py-5 border border-white/10 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase"
              >
                Service
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div
              className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] ${
                type === "material"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-zodiac-primary border-white/20 text-white"
              }`}
            >
              {type === "material" ? "✓ Physical Material" : "✓ Labor Service"}
            </div>

            <button
              onClick={handleStartNew}
              className="py-2 text-[7px] text-white/20 uppercase font-black hover:text-red-400"
            >
              Discard & Reset
            </button>

            <button
              onClick={handleFinalize}
              disabled={isSubmitting || isSubmittingState}
              className={`w-full py-5 mt-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] ${
                isSubmitting
                  ? "bg-white/10 text-white/20"
                  : "bg-white text-black hover:bg-cyan-400"
              }`}
            >
              {isSubmitting ? "Syncing..." : "Finalize Item →"}
            </button>
          </div>
        )}
      </div>

      {/* EXIT */}
      <button
        onClick={handleExit}
        className="mt-auto pb-6 text-[8px] font-black text-white/10 uppercase tracking-[0.4em]"
      >
        ✕ Close Workstation
      </button>
    </div>
  );
}
