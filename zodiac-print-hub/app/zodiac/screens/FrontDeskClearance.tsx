"use client";

import { useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { selectSearchJobs } from "@store/selectors/data.selectors";
import {
  Scan,
  Search,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Package,
  User,
  ArrowRight,
} from "lucide-react";

export function FrontDeskClearance() {
  const [query, setQuery] = useState("");
  const searchJobs = useDataStore(selectSearchJobs(query));
  const { updateDeliveryStatus, collectAndDeliver } = useDataStore();

  // 🧠 Logic: Focus on the most relevant job (exact ShortRef match)
  const job =
    searchJobs.length === 1 || query.length === 4 ? searchJobs[0] : null;

  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Clearance Node
        </h2>
        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
          Front Desk • Collection & Handover
        </p>
      </header>

      {/* --- SEARCH BAR (The Operator's Tool) --- */}
      <div className="relative mb-12 group max-w-xl">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <Scan className="text-cyan-400 animate-pulse" size={20} />
          <div className="w-px h-4 bg-white/10" />
        </div>
        <input
          autoFocus
          placeholder="TYPE SHORTREF (e.g. 7x2a)..."
          value={query}
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
          className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-8 pl-20 pr-8 text-2xl font-black font-mono tracking-[0.5em] focus:border-cyan-400/50 outline-none transition-all placeholder:text-white/5"
        />
      </div>

      <div className="flex-1">
        {job ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="glass-card p-10 border-cyan-400/30 bg-cyan-400/[0.02] rounded-[3rem] grid grid-cols-12 gap-10">
              {/* --- Left: Status & Specs --- */}
              <div className="col-span-7 space-y-8">
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block mb-2">
                    Order Identification
                  </span>
                  <h3 className="text-6xl font-black italic tracking-tighter uppercase">
                    {job.serviceName}
                  </h3>
                  <p className="text-sm font-bold text-white/40 mt-2 uppercase">
                    {job.client?.name} • {job.client?.phone}
                  </p>
                </div>

                <div className="flex gap-10">
                  <div>
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">
                      Dimensions
                    </p>
                    <p className="text-lg font-black font-mono">
                      {job.width}x{job.height}
                      {job.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/20 uppercase mb-1">
                      Quantity
                    </p>
                    <p className="text-lg font-black font-mono">
                      x{job.quantity}
                    </p>
                  </div>
                </div>
              </div>

              {/* --- Right: Financial Clearance --- */}
              <div className="col-span-5 flex flex-col justify-between">
                <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase text-white/20">
                      Balance Due
                    </span>
                    <CheckCircle2
                      size={16}
                      className={
                        job.paymentStatus === "PAID"
                          ? "text-emerald-400"
                          : "text-white/5"
                      }
                    />
                  </div>
                  <p
                    className={`text-5xl font-black font-mono tracking-tighter ${job.paymentStatus === "PAID" ? "text-emerald-400" : "text-red-500"}`}
                  >
                    ₵{(job.totalPrice - (job.totalPaid || 0)).toFixed(2)}
                  </p>
                </div>

                {/* ACTION: Collect & Release */}
                <button className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-2xl">
                  <Package size={20} />
                  Verify Collection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-10">
            <Search size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">
              Waiting for ShortRef Input
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
