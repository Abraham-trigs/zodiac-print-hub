"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@root/lib/api/client";
import {
  TrendingUp,
  Droplets,
  BarChart3,
  DollarSign,
  Percent,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { ProductionReport } from "@/types/zodiac.types";

export function ProductionIntelligenceHub() {
  const [data, setData] = useState<ProductionReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient<{ data: ProductionReport }>(
        "/api/reports/production",
      );
      setData(res.data);
    } catch (err) {
      console.error("Intelligence Fetch Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
        <RefreshCcw className="animate-spin" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em]">
          Calculating Margins...
        </span>
      </div>
    );

  const stats = data?.summary;

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      {/* 1. TOP HUD: NET PROFIT */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Profit Node
          </h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-3">
            Real-Time Production ROI
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-sm font-mono font-black text-emerald-400">
            {stats?.margin.toFixed(1)}%{" "}
            <small className="text-[8px] opacity-40">NET MARGIN</small>
          </span>
        </div>
      </div>

      {/* 2. CORE METRICS GRID */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {/* REVENUE */}
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between h-56 group hover:border-cyan-400/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center mb-4">
            <DollarSign size={24} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">
              Gross Revenue
            </span>
            <p className="text-4xl font-black font-mono tracking-tighter italic">
              ₵{stats?.revenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* MATERIAL COSTS */}
        <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] flex flex-col justify-between h-56">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <BarChart3 size={24} className="text-white/20" />
          </div>
          <div>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">
              Recipe Costs
            </span>
            <p className="text-4xl font-black font-mono tracking-tighter text-white/40 italic">
              ₵{stats?.costs.toFixed(2)}
            </p>
          </div>
        </div>

        {/* THE LEAK (WASTAGE) */}
        <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[3rem] flex flex-col justify-between h-56 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <Droplets size={24} className="text-red-500" />
          </div>
          <div className="z-10">
            <span className="text-[9px] font-black text-red-500/40 uppercase tracking-widest block mb-1">
              Production Leakage
            </span>
            <p className="text-4xl font-black font-mono tracking-tighter text-red-500 italic">
              ₵{stats?.leakage.toFixed(2)}
            </p>
          </div>
          {/* Visual alert for high leakage */}
          {stats && stats.leakage > stats.revenue * 0.1 && (
            <div className="absolute top-6 right-6 text-red-500 animate-pulse">
              <AlertCircle size={20} />
            </div>
          )}
        </div>
      </div>

      {/* 3. EFFICIENCY FEEDBACK */}
      <div className="flex-1 bg-black/20 rounded-[3rem] border border-white/5 p-10 flex items-center justify-between">
        <div className="max-w-md">
          <h4 className="text-xl font-black uppercase italic tracking-tight mb-2">
            Net Take-Home
          </h4>
          <p className="text-[10px] opacity-40 leading-relaxed font-medium uppercase tracking-widest">
            Calculated after material usage and reported wastage. <br />
            Based on {data?.jobCount} successful production cycles.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">
            Final Pocket Value
          </span>
          <p className="text-7xl font-black italic tracking-tighter text-white">
            ₵{stats?.netProfit.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
