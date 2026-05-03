"use client";

import { useState } from "react";
import { useDataStore } from "@store/core/useDataStore";
import { selectSearchJobs } from "@store/selectors/data.selectors";
import {
  Scan,
  Package,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Smartphone,
} from "lucide-react";
import { ZodiacScreen } from "../types/screen.types";

export const FrontDeskClearance: ZodiacScreen = {
  id: "FRONT_DESK_CLEARANCE",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const [query, setQuery] = useState("");
    const searchJobs = useDataStore(selectSearchJobs(query));
    const { updateDeliveryStatus, collectAndDeliver } = useDataStore();

    // Logic: Focus on exact ShortRef match (4 chars)
    const job =
      query.length === 4 ? searchJobs.find((j) => j.shortRef === query) : null;

    return (
      <div className="flex flex-col h-full p-10 text-white animate-in fade-in duration-500">
        <header className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Clearance Node
          </h2>
          <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mt-2">
            Front Desk Verification
          </p>
        </header>

        <div className="relative mb-12 max-w-xl group">
          <Scan
            className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 animate-pulse"
            size={24}
          />
          <input
            autoFocus
            placeholder="ENTER SHORTREF..."
            value={query}
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-10 pl-24 pr-8 text-3xl font-black font-mono tracking-[0.5em] focus:border-cyan-400 outline-none transition-all placeholder:text-white/5"
          />
        </div>

        {job ? (
          <div className="animate-in zoom-in-95 duration-300 grid grid-cols-12 gap-10">
            <div className="col-span-7 p-12 bg-white/[0.02] border border-white/10 rounded-[3rem]">
              <span className="text-[10px] font-black uppercase text-cyan-400 mb-4 block">
                Job Specs
              </span>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
                {job.serviceName}
              </h3>
              <div className="flex gap-10 opacity-60">
                <div>
                  <p className="text-[8px] font-black uppercase">Size</p>
                  <p className="text-xl font-black font-mono">
                    {job.width}x{job.height}
                    {job.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase">Qty</p>
                  <p className="text-xl font-black font-mono">
                    x{job.quantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-5 flex flex-col justify-between p-12 bg-cyan-400 rounded-[3rem] text-black shadow-2xl">
              <div>
                <span className="text-[10px] font-black uppercase opacity-60">
                  Collection Status
                </span>
                <p className="text-5xl font-black font-mono tracking-tighter mt-2">
                  ₵{(job.totalPrice - (job.totalPaid || 0)).toFixed(2)}
                </p>
                <p className="text-[10px] font-bold uppercase mt-2">
                  Remaining Balance Due
                </p>
              </div>
              <button className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Package size={20} /> Authorize Release
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-10">
            <Package size={80} className="mb-6" />
            <p className="text-xs font-black uppercase tracking-[1em]">
              Scanning for Handshake...
            </p>
          </div>
        )}
      </div>
    );
  },
};
