"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Banknote,
} from "lucide-react";

export function WasteAuditContent() {
  // 1. INPUT STATE
  const [rollsPerMonth, setRollsPerMonth] = useState(20);
  const [avgRollCost, setAvgRollCost] = useState(850);
  const [wastePercentage, setWastePercentage] = useState(15);

  // 2. INTELLIGENCE LOGIC
  const analytics = useMemo(() => {
    const monthlySpend = rollsPerMonth * avgRollCost;
    const monthlyWasteCash = monthlySpend * (wastePercentage / 100);
    const yearlyWasteCash = monthlyWasteCash * 12;
    // Zodiac typically reduces waste by 40-60% through nesting
    const zodiacSavings = monthlyWasteCash * 0.5;

    return {
      monthlySpend,
      monthlyWasteCash,
      yearlyWasteCash,
      zodiacSavings,
    };
  }, [rollsPerMonth, avgRollCost, wastePercentage]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* --- HEADER --- */}
      <header className="text-center mb-12">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Calculator className="text-red-500" size={32} />
        </div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
          Leakage Auditor
        </h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
          Quantifying Hidden Production Costs
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* --- LEFT: INPUTS --- */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <InputRange
              label="Rolls Consumed / Month"
              value={rollsPerMonth}
              min={5}
              max={200}
              onChange={setRollsPerMonth}
              suffix="Rolls"
            />
            <InputRange
              label="Avg. Cost per Roll (₵)"
              value={avgRollCost}
              min={200}
              max={5000}
              onChange={setAvgRollCost}
              suffix="GHS"
            />
            <InputRange
              label="Estimated Scrap/Waste %"
              value={wastePercentage}
              min={5}
              max={40}
              onChange={setWastePercentage}
              suffix="%"
            />
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-start gap-4">
            <AlertCircle size={18} className="text-orange-400 mt-1 shrink-0" />
            <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
              * Based on Ghanaian industrial averages, most shops lose 12-18% of
              material to poor nesting and unrecorded offcuts.
            </p>
          </div>
        </div>

        {/* --- RIGHT: THE REVEAL --- */}
        <div className="lg:col-span-7">
          <div className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingDown size={120} />
            </div>

            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest block mb-10">
              Financial Leakage Report
            </span>

            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase mb-2">
                  Monthly Capital Lost
                </p>
                <h3 className="text-6xl font-black italic tracking-tighter text-red-500 font-mono">
                  ₵
                  {analytics.monthlyWasteCash.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </h3>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">
                    Yearly Loss Projection
                  </p>
                  <p className="text-2xl font-black font-mono">
                    ₵{analytics.yearlyWasteCash.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1">
                    Total Roll Spend
                  </p>
                  <p className="text-2xl font-black font-mono">
                    ₵{analytics.monthlySpend.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* THE HOOK */}
              <div className="mt-12 p-8 bg-emerald-400 rounded-[2.5rem] text-black shadow-2xl shadow-emerald-400/20 group cursor-pointer hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <ShieldCheck size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    Zodiac Recovery Target
                  </span>
                </div>
                <p className="text-sm font-bold leading-snug mb-2">
                  Zodiac V2.0 can recover approximately:
                </p>
                <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                  ₵{analytics.zodiacSavings.toLocaleString()}
                  <span className="text-lg">/mo</span>
                </h4>
                <div className="mt-6 flex items-center gap-2 font-black uppercase text-[10px]">
                  Claim This Capital <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputRange({ label, value, min, max, onChange, suffix }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {label}
        </label>
        <span className="text-xs font-black font-mono text-cyan-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400"
      />
    </div>
  );
}
