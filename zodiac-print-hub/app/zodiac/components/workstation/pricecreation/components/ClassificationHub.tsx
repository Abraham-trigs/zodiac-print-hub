"use client";

import { useModalStore } from "@store/useModalStore";
import { useDataStore } from "@store/core/useDataStore";
import { MaterialServiceCatalog } from "./MaterialServiceCatalog";
import { ExcelImportVault } from "./ExcelImportVault"; // 🚀 Import the target
import { WorkstationStatus } from "../../../common/WorkstationStatus";
import { shallow } from "zustand/shallow";
import {
  MaterialCalculationType,
  ServiceCalculationType,
} from "@prisma/client";
import { Database } from "lucide-react";

export function ClassificationHub() {
  const { swapModal, closeModal } = useModalStore();

  // --- STORE V2 ALIGNMENT ---
  const draft = useDataStore((s) => s.pricingDraft, shallow);
  const { mode, type, setMode, setType, resetPricingDraft, createPrice } =
    useDataStore();
  const isSubmitting = useDataStore((s) => s.priceState.isSubmitting);

  const hasExistingProgress = draft?.name !== "" || (draft?.salePrice ?? 0) > 0;
  const isSubmittingState = mode === "submitting";
  const hasType = type !== null;

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleStartNew = () => {
    resetPricingDraft();
    setMode("idle");
    setType(null);
  };

  const handleTypeSwitch = (nextType: "material" | "service") => {
    setType(nextType);
    setMode("draft");
  };

  const handleExit = () => closeModal("GLOBAL");

  const triggerStatus = (
    title: string,
    message: string,
    type: "success" | "error" | "warning",
  ) => {
    swapModal("DETAIL", WorkstationStatus, { title, message, type });
  };

  const handleOpenExcelVault = () => {
    swapModal("DETAIL", ExcelImportVault);
  };

  /**
   * FINALIZE ITEM (The Junction Bridge)
   * Restructures the draft into the Production Recipe
   */
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

    if (draft.salePrice <= 0) {
      setMode("draft");
      return triggerStatus(
        "Rate Required",
        "Selling rate must be > 0.",
        "warning",
      );
    }

    if (!draft.calcType) {
      setMode("draft");
      return triggerStatus(
        "Logic Missing",
        "Please select a Calculation Mode.",
        "warning",
      );
    }

    try {
      // 2. CONSTRUCT PAYLOAD (Aligned with PriceList Junction & Triple-Price Logic)
      const payload = {
        displayName: draft.name,
        salePrice: Number(draft.salePrice),
        type: type?.toUpperCase(),

        ...(type === "material"
          ? {
              materialCategory: draft.category,
              mCalcType: draft.calcType as MaterialCalculationType,
              purchasePrice: Number(draft.purchasePrice || 0),
              unit: draft.unit,
              lowStockThreshold: Number(draft.stockThreshold || 0),
            }
          : {
              serviceCategory: draft.category,
              sCalcType: draft.calcType as ServiceCalculationType,
              basePrice: Number(draft.basePrice || 0),
            }),
      };

      await createPrice(payload);

      setMode("review");
      triggerStatus("Success", `${draft.name} is now live.`, "success");

      setTimeout(() => {
        handleStartNew();
        handleExit();
      }, 2000);
    } catch (err: any) {
      setMode("draft");
      triggerStatus("Sync Error", err?.message || "Failed to save.", "error");
    }
  };

  return (
    <div className="inner-ui-content inner-ui-down modalOpen h-full flex flex-col text-center px-4">
      {/* 1. HEADER */}
      <div className="mt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white leading-none uppercase">
          {hasType ? `${type} PATH` : "CLASSIFICATION"}
        </h2>
        <p className="text-[6px] text-cyan-400 uppercase font-black tracking-[0.3em] mt-2 mb-6">
          {hasType ? "Define the calculation logic below" : "Define Entry Path"}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* 2. RESUME DRAFT VIEW */}
        {!hasType && hasExistingProgress && (
          <div className="grid grid-cols-2 gap-2 mb-2 p-2 bg-white/5 rounded-3xl border border-white/10">
            <button
              onClick={handleStartNew}
              className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase text-white/40 active:scale-95"
            >
              Start New
            </button>
            <button
              onClick={() => handleTypeSwitch("material")}
              className="py-4 bg-cyan-400 border border-cyan-400 rounded-2xl text-[8px] font-black uppercase text-black shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-pulse"
            >
              Resume Draft
            </button>
          </div>
        )}

        {!hasType ? (
          <>
            {/* 🚀 EXCEL VAULT ENTRANCE (New Addition) */}
            <button
              onClick={handleOpenExcelVault}
              className="w-full py-4 border-2 border-dashed border-zodiac-orange/20 rounded-2xl bg-zodiac-orange/5 flex items-center justify-center gap-3 group hover:border-zodiac-orange/50 transition-all mb-1"
            >
              <Database
                size={16}
                className="text-zodiac-orange animate-pulse"
              />
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-black uppercase text-zodiac-orange">
                  Bulk Ingestion
                </span>
                <span className="text-[6px] opacity-40 uppercase font-black tracking-widest text-white">
                  Import spreadsheet data
                </span>
              </div>
            </button>

            <button
              onClick={() => swapModal("DETAIL", MaterialServiceCatalog)}
              className="glass-card w-full py-4 px-6 flex justify-between items-center group active:scale-95 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-cyan-400">
                Select Existing Resource
              </span>
              <span className="opacity-40 text-[10px]">🔍</span>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleTypeSwitch("material")}
                className="py-5 border border-white/10 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase hover:border-cyan-400 transition-all"
              >
                Physical Material
              </button>
              <button
                onClick={() => handleTypeSwitch("service")}
                className="py-5 border border-white/10 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase hover:border-purple-400 transition-all"
              >
                Labor Service
              </button>
            </div>
          </>
        ) : (
          /* 4. LOGIC CONFIGURATION (Active Path) */
          <div className="flex flex-col gap-2">
            <div
              className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${
                type === "material"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-zodiac-primary border-white/20 text-white"
              }`}
            >
              {type === "material" ? "✓ Material Resource" : "✓ Service Effort"}
            </div>

            <div className="text-[7px] text-white/40 uppercase font-black tracking-widest mt-2">
              Logic: {draft.calcType || "Unselected"} • Unit:{" "}
              {draft.unit || "N/A"}
            </div>

            <button
              onClick={handleStartNew}
              className="py-2 text-[7px] text-white/20 uppercase font-black hover:text-red-400 transition-colors"
            >
              Discard & Reset
            </button>

            <button
              onClick={handleFinalize}
              disabled={isSubmitting || isSubmittingState}
              className={`w-full py-5 mt-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                isSubmitting
                  ? "bg-white/10 text-white/20"
                  : "bg-white text-black hover:bg-cyan-400 shadow-xl"
              }`}
            >
              {isSubmitting ? "Syncing to Engine..." : "Finalize Recipe →"}
            </button>
          </div>
        )}
      </div>

      {/* 5. EXIT */}
      <button
        onClick={handleExit}
        className="mt-auto pb-6 text-[8px] font-black text-white/10 uppercase tracking-[0.4em] hover:text-white/40 transition-colors"
      >
        ✕ Close Workstation
      </button>
    </div>
  );
}
