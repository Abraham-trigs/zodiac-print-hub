"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@lib/client/api/client";
import { AlertCircle, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";

/**
 * JOB_INVENTORY_ALERT (V2 Procurement Node)
 * Logic: Scans warehouse for gaps and triggers industrial requisitions.
 */
export function JobInventoryAlert({ jobId }: { jobId: string }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafted, setIsDrafted] = useState(false);

  useEffect(() => {
    // 🧠 Phase 2: Check for physical material shortfalls
    apiClient<{ data: any }>(`/api/procurement/shortfall/${jobId}`)
      .then((res) => setAnalysis(res.data))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleGenerateRequisition = async () => {
    setIsSubmitting(true);
    try {
      // 🚀 Phase 3: Transition intent to a formal StockPurchaseOrder
      const res = await apiClient<{ data: any }>(
        "/api/procurement/orders/requisition",
        {
          method: "POST",
          body: { jobId },
        },
      );

      if (res.data) {
        setIsDrafted(true);
        // Optimization: We could trigger a toast or navigate to the Supply Node here
      }
    } catch (err) {
      console.error("Procurement block failed to resolve:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !analysis || analysis.hasEnough) return null;

  return (
    <div
      className={`bg-red-500/10 border border-red-500/20 rounded-3xl p-5 mt-4 animate-in slide-in-from-top-2 transition-all ${isDrafted ? "opacity-50 grayscale" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
          <AlertCircle size={16} className="text-white" />
        </div>
        <div>
          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
            Inventory Block
          </span>
          <p className="text-[10px] font-bold text-white/80">
            Shortfall: {analysis.shortfall} {analysis.productionUnit}
          </p>
        </div>
      </div>

      <div className="bg-black/20 rounded-2xl p-4 space-y-2 border border-white/5">
        <p className="text-[9px] text-white/40 uppercase font-black tracking-tighter italic">
          Required Action:
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-cyan-400 uppercase">
            Buy {analysis.unitsToOrder} {analysis.buyUnit}(s)
          </span>
          <span className="text-[10px] font-mono font-bold opacity-40">
            ~₵{analysis.estimatedCost}
          </span>
        </div>

        {analysis.supplier ? (
          <p className="text-[8px] font-bold text-white/20 uppercase">
            Source: {analysis.supplier.name}
          </p>
        ) : (
          <p className="text-[8px] font-black text-orange-400 uppercase">
            ⚠️ No Supplier Assigned
          </p>
        )}
      </div>

      <button
        disabled={isSubmitting || isDrafted || !analysis.supplier}
        onClick={handleGenerateRequisition}
        className="w-full mt-4 py-3 bg-white text-black font-black uppercase text-[9px] rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 size={12} className="animate-spin" />
        ) : isDrafted ? (
          <>
            <CheckCircle2 size={12} className="text-emerald-600" />
            PO Drafted
          </>
        ) : (
          <>
            <ShoppingCart size={12} />
            Generate Purchase Requisition
          </>
        )}
      </button>

      {!analysis.supplier && !isDrafted && (
        <p className="text-[7px] text-center mt-2 font-black uppercase text-orange-400/50">
          Assign a supplier to material to enable auto-buying
        </p>
      )}
    </div>
  );
}
