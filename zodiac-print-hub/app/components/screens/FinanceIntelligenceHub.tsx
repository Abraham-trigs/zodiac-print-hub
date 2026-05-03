"use client";

import { useDataStore } from "@store/core/useDataStore";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertCircle,
  ArrowUpRight,
  Calculator,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@lib/client/api/client";
import { ZodiacScreen } from "@types/screen.types";

/**
 * FINANCE_HUB_SCREEN
 * The "Audit Nerve Center" of Zodiac.
 * Normalizes all shop revenue, COGS, and leakage into a P&L view.
 */
export const FinanceIntelligenceHub: ZodiacScreen = {
  id: "FINANCE_HUB",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // 🚀 V2 HANDSHAKE: Call the analytical aggregator
      apiClient<{ data: any }>("/api/analytics/finance")
        .then((res) => setData(res.data))
        .finally(() => setLoading(false));
    }, []);

    if (loading || !data)
      return (
        <div className="h-full flex items-center justify-center animate-pulse font-black text-cyan-400 text-[10px] tracking-[0.5em] uppercase">
          Syncing Financial Node...
        </div>
      );

    return (
      <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
        <header className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Finance Hub
          </h2>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-2">
            P&L & Performance Ledger
          </p>
        </header>

        {/* --- REVENUE STRIP --- */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-8 p-10 bg-white/5 border border-white/10 rounded-[3rem] flex justify-between items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp size={120} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2">
                Monthly Gross Revenue
              </span>
              <h3 className="text-7xl font-black italic tracking-tighter leading-none">
                ₵{data.grossRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="text-right">
              <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                +12.4% <span className="opacity-40">vs Last Month</span>
              </span>
            </div>
          </div>

          {/* NET PROFIT CARD (The "Bottom Line") */}
          <div className="col-span-4 p-10 bg-emerald-400 rounded-[3rem] text-black shadow-2xl shadow-emerald-400/20 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-default">
            <div className="flex justify-between items-start">
              <Calculator size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Net Profit
              </span>
            </div>
            <h3 className="text-5xl font-black italic tracking-tighter leading-none">
              ₵{data.netProfit.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* --- EXPENSE HUD --- */}
        <div className="grid grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {/* COGS (Production Cost) */}
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col justify-between h-56">
            <TrendingDown className="text-orange-400/40" size={24} />
            <div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
                Production Cost (COGS)
              </span>
              <p className="text-3xl font-black font-mono">
                ₵{data.cogs.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-orange-400 uppercase mt-2">
                Material & Yield Costs
              </p>
            </div>
          </div>

          {/* LEAKAGE (Waste value) */}
          <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex flex-col justify-between h-56 group hover:bg-red-500/10 transition-all">
            <AlertCircle className="text-red-500/40" size={24} />
            <div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
                Financial Leakage
              </span>
              <p className="text-3xl font-black font-mono text-red-500">
                ₵{data.leakageValue.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-red-400/60 uppercase mt-2 italic">
                Capital lost to wastage
              </p>
            </div>
          </div>

          {/* TAX ESTIMATE */}
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col justify-between h-56">
            <Percent className="text-white/20" size={24} />
            <div>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
                Est. Tax Provision
              </span>
              <p className="text-3xl font-black font-mono opacity-40">
                ₵{data.taxEstimate.toLocaleString()}
              </p>
              <p className="text-[9px] font-bold text-white/20 uppercase mt-2">
                Presumptive provision
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
