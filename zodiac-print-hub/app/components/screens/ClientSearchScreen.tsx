"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
import { useDataStore } from "../../zodiac/store/core/useDataStore";
import { useZodiac } from "../../zodiac/store/zodiac.store"; // ✅ Engine Sync
import { ZodiacScreen } from "../../types/screen.types";
import { selectClientsArray } from "../../zodiac/store/selectors/data.selectors";

/**
 * CLIENT_SEARCH SCREEN
 * Aligned with Job Manager aesthetic for selecting a Customer
 */
export const ClientSearchScreen: ZodiacScreen = {
  id: "CLIENT_SEARCH",
  layoutMode: "DETAIL",

  TopComponent: () => {
    /* -------------------------
       STATE & NAVIGATION
    --------------------------*/
    const { goBack } = useZodiac();
    const clients = useDataStore(selectClientsArray, shallow);
    const setDraft = useDataStore((s) => s.setDraft);
    const [searchQuery, setSearchQuery] = useState("");

    /* -------------------------
       LOGIC (Synced with Client Model)
    --------------------------*/
    const filtered = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return clients;
      return clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)),
      );
    }, [clients, searchQuery]);

    const handleSelect = (clientId: string) => {
      // ✅ ALIGNMENT: Capture ID for backend JobService
      setDraft({ clientId });
      goBack(); // Return to Draft
    };

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        {/* 1. HEADER (Mirrored from Job Manager) */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Customer Directory</h2>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">
              {clients.length} Registered Clients
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            👤
          </div>
        </div>

        {/* 2. SEARCH (Mirrored from Job Manager) */}
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:border-emerald-400 outline-none transition-all placeholder:opacity-20 text-white"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* 3. LIST (Mirrored Glass Card Style) */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-emerald-400/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                    {c.phone || "No Phone Registered"}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-white/40 font-mono text-[10px] uppercase">
                    Jobs:{" "}
                    <span className="text-white font-bold">
                      {c.totalJobs || 0}
                    </span>
                  </div>
                  <div className="text-[8px] uppercase font-black tracking-tighter opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity">
                    SELECT →
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <p className="text-xs uppercase tracking-widest font-bold">
                No Customers Found
              </p>
              <button className="mt-4 text-[10px] underline tracking-tighter text-emerald-400">
                Register New Client
              </button>
            </div>
          )}
        </div>

        {/* 4. FOOTER (Mirroring Exit style) */}
        <div className="mt-auto pb-4">
          <button
            onClick={goBack}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase font-black tracking-[0.3em] hover:text-emerald-400 hover:border-emerald-400/30 transition-all"
          >
            ← Cancel Selection
          </button>
        </div>
      </div>
    );
  },

  DownComponent: undefined,
};
