"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  Package,
  Clock,
  Truck,
  Settings2,
  Layers,
  ShieldAlert,
  ChevronRight,
  Save,
} from "lucide-react";

export function PriceCreationWorkstation() {
  const { pricingDraft, setPricingDraft, type } = useDataStore();

  // 🚀 LOGIC: We only show Logistics fields if the user is creating a 'material' base
  const isMaterial = type === "material";

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto p-10 text-white animate-in fade-in zoom-in-95 duration-500">
      {/* ... Existing Name/Price Steps ... */}

      {isMaterial && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* --- SECTION: PROCUREMENT INTELLIGENCE --- */}
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Truck size={60} />
            </div>

            <header className="mb-8">
              <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                <Settings2 size={20} className="text-cyan-400" />
                Logistics Specs
              </h3>
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">
                Automated Supply Chain Rules
              </p>
            </header>

            <div className="grid grid-cols-2 gap-6">
              {/* 1. LEAD TIME */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Supplier Lead Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricingDraft.leadTimeDays}
                    onChange={(e) =>
                      setPricingDraft({
                        leadTimeDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black focus:border-cyan-400/50 outline-none transition-all font-mono"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-20 uppercase">
                    Days
                  </span>
                </div>
              </div>

              {/* 2. MIN ORDER QTY */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                  <Package size={12} /> Min. Order (MOQ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricingDraft.minOrderQty}
                    onChange={(e) =>
                      setPricingDraft({
                        minOrderQty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black focus:border-cyan-400/50 outline-none transition-all font-mono"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-20 uppercase">
                    Units
                  </span>
                </div>
              </div>

              {/* 3. BUY QUANTITY (Linear to Piece Translation) */}
              <div className="col-span-2 space-y-3 p-6 bg-cyan-400/5 border border-cyan-400/10 rounded-3xl">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                    <Layers size={12} /> Physical Yield per{" "}
                    {pricingDraft.buyUnit || "Roll"}
                  </label>
                  <select
                    value={pricingDraft.buyUnit}
                    onChange={(e) =>
                      setPricingDraft({ buyUnit: e.target.value })
                    }
                    className="bg-transparent text-[9px] font-black uppercase text-white/40 outline-none cursor-pointer hover:text-white"
                  >
                    <option value="roll">Roll</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={pricingDraft.buyQuantity}
                    onChange={(e) =>
                      setPricingDraft({
                        buyQuantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-transparent border-b border-white/10 p-4 text-3xl font-black focus:border-cyan-400 outline-none transition-all font-mono"
                  />
                  <span className="absolute right-0 bottom-4 text-[10px] font-black opacity-30 uppercase italic">
                    {pricingDraft.unit || "sqft"} Total
                  </span>
                </div>
                <p className="text-[7px] text-white/20 uppercase font-bold italic mt-2">
                  * System logic: Ordering 1 {pricingDraft.buyUnit} adds{" "}
                  {pricingDraft.buyQuantity} {pricingDraft.unit} to stock.
                </p>
              </div>

              {/* 4. STOCK THRESHOLD */}
              <div className="col-span-2 space-y-3">
                <label className="text-[9px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
                  <ShieldAlert size={12} /> Low Stock Safety Floor
                </label>
                <input
                  type="number"
                  value={pricingDraft.stockThreshold}
                  onChange={(e) =>
                    setPricingDraft({
                      stockThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black focus:border-red-400/50 outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... Submission Button ... */}
    </div>
  );
}
