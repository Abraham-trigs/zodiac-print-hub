"use client";

import { useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { useZodiac } from "@store/zodiac.store";
import { ZodiacScreen } from "../types/screen.types";
import { shallow } from "zustand/shallow";
import { ZodiacCloseAction } from "@ui/ZodiacCloseAction.tsx";

type DetailTab = "INTELLIGENCE" | "LEDGER" | "WASTAGE" | "SETTINGS";

export const PriceStockDetailScreen: ZodiacScreen = {
  id: "PRICE_STOCK_DETAIL",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { goBack } = useZodiac();
    const [activeTab, setActiveTab] = useState<DetailTab>("INTELLIGENCE");

    // 🔥 V2 ALIGNMENT: Resolve everything via the priceListId junction
    const draft = useDataStore((s) => s.draftState.draft, shallow);

    const priceEntry = useDataStore((s) =>
      draft?.priceListId ? s.priceState.prices[draft.priceListId] : null,
    );

    // Physical data is now nested inside the price entry
    const material = priceEntry?.material;

    // Check inventory specifically for the linked materialId
    const stock = useDataStore((s) =>
      material?.id ? s.inventoryState.inventory[material.id] : null,
    );

    if (!priceEntry)
      return (
        <div className="flex items-center justify-center h-full text-white/20 font-black uppercase text-[10px] tracking-widest">
          Node Connection Lost • Select Resource
        </div>
      );

    return (
      <div className="flex flex-col h-full p-8 text-white animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* 1. UNIVERSAL ACTION HUB */}
        <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-cyan-400 uppercase tracking-widest backdrop-blur-md">
            Status: {priceEntry.isActive ? "Live" : "Archived"}
          </div>
          <ZodiacCloseAction
            mode="AUTO"
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/30 shadow-2xl transition-all"
          />
        </div>

        {/* 2. IDENTITY AREA */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="group flex items-center gap-2 mb-6 active:scale-95 transition-all text-white/40 hover:text-cyan-400"
          >
            <span className="text-xs">←</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">
              Return to Vault
            </span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${material ? "bg-emerald-400/20 text-emerald-400" : "bg-blue-400/20 text-blue-400"}`}
            >
              {material ? "Junction: Material" : "Junction: Service"}
            </span>
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">
              {priceEntry.materialCategory ||
                priceEntry.serviceCategory ||
                "General"}
            </span>
          </div>
          <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none max-w-[70%]">
            {priceEntry.displayName}
          </h2>
        </div>

        {/* 3. TAB NAVIGATION */}
        <div className="flex gap-8 border-b border-white/5 mb-10">
          {(
            ["INTELLIGENCE", "LEDGER", "WASTAGE", "SETTINGS"] as DetailTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? "text-cyan-400" : "text-white/20 hover:text-white/40"}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />
              )}
            </button>
          ))}
        </div>

        {/* 4. CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {activeTab === "INTELLIGENCE" && (
            <div className="grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {/* RETAIL PRICE */}
              <div className="col-span-1 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                  Retail Rate
                </span>
                <div>
                  <p className="text-4xl font-black text-white italic leading-none">
                    ₵{priceEntry.salePrice.toFixed(2)}
                  </p>
                  <span className="text-[9px] font-black text-cyan-400 uppercase mt-2 block">
                    Basis: {material?.unit || "Job"}
                  </span>
                </div>
              </div>

              {/* UNIT COST */}
              <div className="col-span-1 bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                  Purchase Cost
                </span>
                <div>
                  <p className="text-4xl font-black text-white/40 italic leading-none">
                    ₵
                    {(
                      material?.purchasePrice ||
                      priceEntry.service?.basePrice ||
                      0
                    ).toFixed(2)}
                  </p>
                  <span className="text-[9px] font-black text-white/20 uppercase mt-2 block">
                    Margin Buffer
                  </span>
                </div>
              </div>

              {/* STOCK BALANCE */}
              <div className="col-span-1 bg-emerald-400/5 border border-emerald-400/10 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                  Live Inventory
                </span>
                {stock ? (
                  <div>
                    <p className="text-4xl font-black text-white italic leading-none">
                      {stock.totalRemaining.toFixed(1)}
                    </p>
                    <span className="text-[9px] font-black text-emerald-400/40 uppercase mt-2 block">
                      {material?.unit} Remaining
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] font-black text-white/10 uppercase italic">
                    Digital Logic Only
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "LEDGER" && (
            <div className="bg-black/20 rounded-[3rem] border border-white/5 p-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between py-6 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-white uppercase">
                    System Snapshot
                  </span>
                  <span className="text-[8px] text-white/20 font-black uppercase tracking-tighter">
                    Current Balance on Node
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {stock?.totalRemaining || 0} {material?.unit}
                  </span>
                </div>
              </div>
              {/* Note: This is where we will map through actual movements soon */}
            </div>
          )}

          {activeTab === "WASTAGE" && (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
                No Loss Records Detected
              </span>
            </div>
          )}

          {activeTab === "SETTINGS" && (
            <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[3rem]">
              <h4 className="text-[10px] font-black text-red-400 uppercase mb-4 tracking-widest">
                Danger Zone
              </h4>
              <button className="px-6 py-3 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all">
                Archive Resource
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
