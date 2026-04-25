"use client";

import { useState, useEffect, useRef } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useModalStore } from "@/store/useModalStore";
import { useZodiac } from "@store/zodiac.store"; // 🔥 Added Zodiac Store
import { shallow } from "zustand/shallow";

export function PriceEntryStepModal() {
  const [step, setStep] = useState<
    "STOCK_TYPE" | "NAME" | "CATEGORY" | "PRICING" | "INITIAL_STOCK"
  >("STOCK_TYPE");

  // Store Actions
  const { closeModal } = useModalStore();
  const { setScreen } = useZodiac(); // 🔥 Navigation Engine

  /* -------------------------
     STORE ACCESS
  --------------------------*/
  const storeDraft = useDataStore((s) => s.draftState?.draft, shallow);
  const setDraft = useDataStore((s) => s.setDraft);
  const { createPrice, orgId } = useDataStore();

  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "piece",
    priceGHS: 0,
    costPrice: 0,
    stockRefId: "",
    quantity: 0,
    isPhysical: false,
  });

  const lastSelectedId = useRef<string | null>(null);

  /* =========================================================
     SYNC LOGIC (Loop-Proof)
  ========================================================= */

  useEffect(() => {
    // Detect selection from Catalog (via Navigation goBack)
    if (storeDraft && storeDraft.stockRefId !== lastSelectedId.current) {
      lastSelectedId.current =
        storeDraft.stockRefId || storeDraft.name || "new";

      setForm((prev) => ({ ...prev, ...storeDraft }));

      if (storeDraft.name && step === "STOCK_TYPE") {
        setStep("NAME");
      }
    }
  }, [storeDraft, step]);

  const updateForm = (updates: Partial<typeof form>) => {
    const nextForm = { ...form, ...updates };
    setForm(nextForm);
    setDraft(nextForm);
  };

  /* =========================================================
     UX HANDLERS
  ========================================================= */

  const handleOpenCatalog = () => {
    /**
     * 🔥 ACTION: NAVIGATE
     * Since MaterialServiceCatalog is a ZodiacScreen, we use setScreen.
     * This ensures the layoutMode: "DETAIL" is handled by the Shell properly.
     */
    setScreen("MATERIAL_SERVICE_CATALOG");
  };

  const handleSave = async () => {
    await createPrice({ ...form, orgId });
    setDraft(null);
    closeModal("DOWN"); // Close this modal
  };

  return (
    <div className="flex flex-col h-full w-full p-3 overflow-hidden">
      <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500">
        {/* HUD */}
        <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-8 block">
          Process: {step.replace("_", " ")}
        </span>

        {step === "STOCK_TYPE" && (
          <div className="flex flex-col gap-3 animate-in fade-in">
            <h2 className="text-white text-xl font-black mb-2">
              Base Identity
            </h2>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleOpenCatalog}
                className={`w-full py-4 px-6 border rounded-2xl flex justify-between items-center transition-all active:scale-95 ${
                  form.stockRefId
                    ? "bg-cyan-400/10 border-cyan-400/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="text-left">
                  <span
                    className={`${form.stockRefId ? "text-cyan-400" : "text-white"} text-xs font-black block`}
                  >
                    {form.stockRefId
                      ? "Linked: " + form.name
                      : "Material Catalog"}
                  </span>
                  <span className="text-[6px] text-white/20 uppercase font-black">
                    Existing Inventory
                  </span>
                </div>
                <span
                  className={form.stockRefId ? "text-cyan-400" : "opacity-20"}
                >
                  🔍
                </span>
              </button>

              <button
                onClick={() => {
                  updateForm({ isPhysical: true, stockRefId: "" });
                  setStep("NAME");
                }}
                className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-white/40 text-[9px] uppercase font-black active:bg-white/5 transition-all"
              >
                + Register New Material
              </button>
            </div>

            <button
              onClick={() => {
                updateForm({ isPhysical: false, stockRefId: "" });
                setStep("NAME");
              }}
              className="text-white/20 text-[8px] uppercase mt-4 font-black hover:text-white"
            >
              Skip: Pure Service Rate
            </button>
          </div>
        )}

        {step === "NAME" && (
          <div className="animate-in fade-in">
            <span className="text-[7px] text-white/20 uppercase font-black mb-2 block">
              Set Display Name
            </span>
            <input
              autoFocus
              className="input-large"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && setStep("CATEGORY")}
            />
          </div>
        )}

        {step === "CATEGORY" && (
          <div className="animate-in fade-in">
            <span className="text-[7px] text-white/20 uppercase font-black mb-2 block">
              Group Label
            </span>
            <input
              autoFocus
              className="input-large"
              value={form.category}
              placeholder="e.g. Large Format"
              onChange={(e) => updateForm({ category: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && setStep("PRICING")}
            />
          </div>
        )}

        {step === "PRICING" && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex flex-col gap-1">
              <span className="text-[7px] text-cyan-400 font-black uppercase tracking-widest">
                Rate (GHS)
              </span>
              <input
                autoFocus
                type="number"
                className="input-large !text-6xl"
                placeholder="0"
                onChange={(e) =>
                  updateForm({ priceGHS: Number(e.target.value) })
                }
              />
            </div>
            <button onClick={handleSave} className="confirm-btn">
              Finalize Entry →
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .input-large {
          @apply w-full bg-transparent text-center text-4xl font-black outline-none text-white py-4 border-b border-white/5 focus:border-cyan-400/30 transition-all;
        }
        .confirm-btn {
          @apply w-full py-4 bg-white text-black font-black uppercase text-[10px] rounded-xl active:scale-95 transition-all shadow-xl;
        }
      `}</style>
    </div>
  );
}

PriceEntryStepModal.modalId = "PRICE_ENTRY_STEP";
