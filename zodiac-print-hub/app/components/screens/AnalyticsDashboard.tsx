"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "../../zodiac/store/core/useDataStore";
import { useZodiac } from "../../zodiac/store/zodiac.store";
import { ZodiacScreen } from "../../types/screen.types";

export const AnalyticsDashboard: ZodiacScreen = {
  id: "ANALYTICS",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const [range, setRange] = useState<"DAILY" | "WEEKLY" | "YEARLY">("DAILY");
    const { jobs, prices, inventory } = useDataStore();
    const { setScreen } = useZodiac();

    // 1. Dynamic Metric Engine (Calculates real data from Store)
    const stats = useMemo(() => {
      const now = new Date();

      const filteredJobs = jobs.filter((job) => {
        const jobDate = new Date(job.createdAt);
        if (range === "DAILY")
          return jobDate.toDateString() === now.toDateString();
        if (range === "WEEKLY") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return jobDate >= weekAgo;
        }
        return true; // Yearly/All
      });

      const revenue = filteredJobs.reduce(
        (acc, curr) => acc + (curr.isPaid ? curr.totalEstimate : 0),
        0,
      );
      const wasteQty = filteredJobs.reduce(
        (acc, curr) => acc + (curr.materialWastage || 0),
        0,
      );

      // Calculate Monetary Loss (Feature 8.4)
      const wasteLoss = filteredJobs.reduce((acc, curr) => {
        const service = prices.find((p) => p.id === curr.serviceId);
        const material = inventory.find((i) => i.id === service?.stock_ref);
        return (
          acc + (curr.materialWastage || 0) * (material?.lastUnitCost || 0)
        );
      }, 0);

      return { revenue, wasteQty, wasteLoss, count: filteredJobs.length };
    }, [range, jobs, prices, inventory]);

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">
              Business Intelligence
            </h2>
            <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">
              Feature 17: Timeframe Analysis
            </p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="bg-white/5 border border-white/10 text-[10px] font-black p-2 rounded-xl outline-none text-cyan-400 uppercase"
          >
            <option value="DAILY">Today</option>
            <option value="WEEKLY">This Week</option>
            <option value="YEARLY">Full History</option>
          </select>
        </header>

        {/* CORE KPI BOXES (Feature 17.1) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] opacity-40 uppercase font-bold">
              Total Revenue
            </span>
            <span className="text-2xl font-mono font-bold text-green-400">
              ₵{stats.revenue.toLocaleString()}
            </span>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
            <span className="text-[9px] opacity-40 uppercase font-bold text-orange-400">
              Material Loss
            </span>
            <span className="text-2xl font-mono font-bold text-orange-400">
              ₵{stats.wasteLoss.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ANALYTICS CHARTS (Feature 17.2) - Visualizing Growth */}
        <div className="bg-white/5 rounded-3xl border border-white/5 p-5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase opacity-40">
              Job Volume Trend
            </span>
            <span className="text-[9px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
              +12.4% vs prev.
            </span>
          </div>
          <div className="h-24 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/5 rounded-t-lg relative group overflow-hidden"
              >
                <div
                  className="absolute bottom-0 w-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-1000"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* OPERATIONAL INSIGHTS (Feature 4.4 & 17) */}
        <div className="grid grid-cols-3 gap-3 text-center py-4 border-t border-white/5">
          <div>
            <span className="text-[8px] opacity-40 uppercase font-bold">
              Jobs
            </span>
            <p className="text-sm font-bold">{stats.count}</p>
          </div>
          <div>
            <span className="text-[8px] opacity-40 uppercase font-bold">
              Waste Qty
            </span>
            <p className="text-sm font-bold">{stats.wasteQty.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-[8px] opacity-40 uppercase font-bold">
              Efficiency
            </span>
            <p className="text-sm font-bold text-cyan-400">
              {stats.revenue > 0
                ? (100 - (stats.wasteLoss / stats.revenue) * 100).toFixed(1)
                : 100}
              %
            </p>
          </div>
        </div>

        <button
          onClick={() => setScreen("WELCOME")}
          className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
        >
          ← Back to Terminal
        </button>
      </div>
    );
  },
};
