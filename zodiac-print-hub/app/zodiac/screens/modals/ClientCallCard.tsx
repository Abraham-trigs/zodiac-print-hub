"use client";

import { ClientProfile } from "@types/client.profile";

export function ClientCallCard({ client }: { client: ClientProfile }) {
  return (
    <div className="glass-card p-6 w-full max-w-sm border-cyan-500/30 overflow-hidden relative">
      {/* NEW CLIENT BADGE (Feature 5.2) */}
      {client.isNew && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
          New Client
        </div>
      )}

      {/* HEADER: Profile & Contact (Feature 5.6) */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-white/10 bg-blue-900 flex items-center justify-center overflow-hidden">
          {client.avatarUrl ? (
            <img src={client.avatarUrl} alt="" />
          ) : (
            <span className="text-2xl opacity-30">👤</span>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold leading-tight">{client.name}</h2>
          <p className="text-[10px] opacity-50 font-mono lowercase">
            {client.email}
          </p>
        </div>
      </div>

      {/* QUICK INSIGHTS (Feature 5.4 & 5.5) */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <p className="text-[9px] opacity-40 uppercase mb-1">Most Printed</p>
          <span className="text-xs font-bold text-cyan-400">
            {client.mostPrinted}
          </span>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <p className="text-[9px] opacity-40 uppercase mb-1">Last Order</p>
          <span className="text-xs font-bold">{client.lastJobDate}</span>
        </div>
      </div>

      {/* RELATIONSHIP SYNC (Feature 5.3) */}
      <div className="flex items-center justify-between p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
        <div className="flex flex-col">
          <span className="text-[9px] opacity-60 uppercase">
            Recently worked with
          </span>
          <span className="text-xs font-bold">{client.lastStaff}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
          🤝
        </div>
      </div>

      <button className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all">
        Create New Request
      </button>
    </div>
  );
}
