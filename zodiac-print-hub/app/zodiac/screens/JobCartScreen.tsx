"use client";

import { useState, useMemo } from "react";
import { shallow } from "zustand/shallow";

import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";
import { useDataStore } from "../store/core/useDataStore";

// Aligned with new folder structure
import { JobEntryModal } from "./modals/JobEntryModal";
import { JobDetailsModal } from "./modals/JobDetailsModal";
import { JobCardSkeleton } from "../components/common/skeleton/JobCardSkeleton";
import { RefreshButton } from "../components/common/RefreshButton";

import { selectJobsWithRelations } from "../store/selectors/data.selectors";

export const JobCartScreen: ZodiacScreen = {
  id: "JOB_CART",
  layoutMode: "DETAIL",

  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { openModal, closeModal } = useModalStore();

    // --- 1. DATA SOURCES (V2 ALIGNED) ---
    const jobs = useDataStore(selectJobsWithRelations, shallow);
    const isLoading = useDataStore((s: any) => s.jobState.isLoading);

    // 🔥 ALIGNMENT: Grab currentOrgId to ensure initData is scoped correctly
    const currentOrgId = useDataStore((s: any) => s.currentOrgId);
    const initData = useDataStore((s: any) => s.initData);

    const [searchQuery, setSearchQuery] = useState("");

    // --- 2. FILTER LOGIC ---
    const filteredJobs = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return jobs;

      return jobs.filter(
        (job) =>
          job.id.toLowerCase().includes(q) ||
          job.client?.name?.toLowerCase().includes(q) ||
          job.serviceName?.toLowerCase().includes(q), // 🔥 FIXED: Use serviceName snapshot
      );
    }, [jobs, searchQuery]);

    const handleOpenCreation = () => {
      // ✅ Using the Aligned Modal Name
      openModal("GLOBAL", JobEntryModal);
    };

    const handleOpenDetails = (jobId: string) => {
      openModal("GLOBAL", JobDetailsModal, { jobId });
    };

    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
        {/* HEADER */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                Job Manager
              </h2>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">
                {isLoading ? "Syncing..." : `${jobs.length} Active Records`}
              </p>
            </div>
            <RefreshButton
              onRefresh={() => initData(currentOrgId)} // 🔥 FIXED: Pass orgId to sync
              isLoading={isLoading}
            />
          </div>

          <button
            className="w-12 h-12 rounded-full bg-zodiac-orange text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-90 transition-all"
            onClick={handleOpenCreation}
          >
            +
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Reference, Client, or Service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-sm focus:border-cyan-400 outline-none transition-all placeholder:opacity-20 font-bold"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xs">
            🔍
          </span>
        </div>

        {/* LIST */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleOpenDetails(job.id)}
                className="glass-card p-5 flex items-center justify-between border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/5 text-white/40 text-[9px] font-black px-2 py-0.5 rounded border border-white/10 tracking-widest">
                      #{job.id}
                    </span>
                    <span className="text-sm font-black truncate max-w-[140px] uppercase tracking-tight">
                      {job.serviceName}{" "}
                      {/* 🔥 FIXED: Aligned with snapshot field */}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-40 font-black uppercase tracking-widest">
                    {job.client?.name || "Anonymous Client"}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono font-black text-sm">
                    ₵{job.totalPrice.toFixed(2)}
                  </div>
                  <div
                    className={`text-[9px] uppercase font-black tracking-tighter mt-1 ${
                      job.status === "COMPLETED"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    ● {job.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <span className="text-5xl mb-4">📂</span>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black">
                No active jobs found
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-auto pb-6">
          <button
            onClick={() => setScreen("WELCOME")}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/20 text-[10px] uppercase font-black tracking-[0.4em] hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
          >
            ← Exit Workspace
          </button>
        </div>
      </div>
    );
  },

  DownComponent: undefined,
};
