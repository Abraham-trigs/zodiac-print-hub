"use client";

import { useState } from "react";

export function FileVersionManager({
  jobContainer,
}: {
  jobContainer: JobFilesContainer;
}) {
  const current = jobContainer.versions.find(
    (v) => v.versionId === jobContainer.currentActiveVersionId,
  );

  return (
    <div className="glass-card p-6 w-full max-w-md border-cyan-500/20 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-tighter">
          File Versions
        </h2>
        <button className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold rounded-lg uppercase">
          + Upload Update
        </button>
      </div>

      {/* ACTIVE PRINT FILE (Feature 18.1) */}
      <div className="bg-cyan-400/10 border border-cyan-400/30 p-4 rounded-2xl mb-6 relative">
        <span className="absolute top-0 right-4 -translate-y-1/2 bg-cyan-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
          PRINT READY
        </span>
        <div className="flex items-center gap-3">
          <div className="text-2xl">📄</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold truncate max-w-[200px]">
              {current?.fileName}
            </span>
            <span className="text-[10px] opacity-50">
              v{jobContainer.versions.length} • {current?.fileSize}
            </span>
          </div>
        </div>
      </div>

      {/* REVISION HISTORY (Feature 18.2) */}
      <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-2">
        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
          History
        </label>
        {jobContainer.versions.map((v, i) => (
          <div
            key={v.versionId}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/20 transition-all"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium opacity-80">
                {v.changeLog || "Initial Upload"}
              </span>
              <span className="text-[9px] opacity-40">
                {new Date(v.timestamp).toLocaleDateString()} by {v.uploadedBy}
              </span>
            </div>
            <button className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Restore
            </button>
          </div>
        ))}
      </div>

      <p className="text-[9px] opacity-30 text-center italic mt-6">
        Feature 18: View current or time frame of company analysis updates on
        submitted jobs.
      </p>
    </div>
  );
}
