"use client";

import { usePriceStore } from "../store/price.store";

export function MarketComparisonModal({ serviceId }) {
  const service = usePriceStore((s) =>
    s.services.find((i) => i.id === serviceId),
  );
  const comparison = calculateMarketGap(serviceId, service?.priceGHS || 0);

  if (!comparison) return null;

  return (
    <div className="glass-card p-6 w-full max-w-sm border-cyan-500/20 bg-zinc-900 animate-in fade-in zoom-in">
      <h2 className="text-xl font-bold mb-4 tracking-tighter">
        Market Comparison
      </h2>

      <div className="flex flex-col gap-5">
        {/* YOUR PRICE VS MARKET */}
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-40 uppercase">Your Price</span>
            <span className="text-xl font-mono font-bold">
              ₵{service?.priceGHS}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-bold ${comparison.isHigher ? "text-orange-400" : "text-cyan-400"}`}
            >
              {comparison.isHigher ? "↑" : "↓"} {Math.abs(comparison.diff)}%
            </span>
            <p className="text-[10px] opacity-40 uppercase">Vs Market Avg</p>
          </div>
        </div>

        {/* MARKET RANGE VISUALIZER */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] uppercase opacity-40 font-bold">
            <span>₵{comparison.marketRange[0]} (Low)</span>
            <span>₵{comparison.marketRange[1]} (High)</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
            <div
              className="absolute h-full bg-cyan-400 opacity-50"
              style={{ left: "20%", width: "60%" }} // Represents the typical market density
            />
          </div>
        </div>

        <p className="text-[10px] opacity-50 italic text-center px-4 leading-tight">
          💡 Being <span className="text-cyan-400 font-bold">below</span>{" "}
          average helps you dominate the B2B sector, while being{" "}
          <span className="text-orange-400 font-bold">above</span> average
          should reflect premium material quality.
        </p>
      </div>
    </div>
  );
}
