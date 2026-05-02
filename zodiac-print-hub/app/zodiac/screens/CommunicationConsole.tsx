"use client";

import {
  MessageSquare,
  CheckCheck,
  Clock,
  Send,
  ShieldAlert,
} from "lucide-react";

export function CommunicationConsole() {
  return (
    <div className="flex flex-col h-full p-8 text-white animate-in fade-in duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Comm Node
        </h2>
        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-2">
          Automated WhatsApp Dispatch
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2">
        {/* --- MESSAGE LOG CARD --- */}
        <div className="glass-card p-6 border-white/5 bg-white/[0.02] flex items-center justify-between group">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <MessageSquare size={20} className="text-emerald-500" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase">
                Approval Link Sent
              </h4>
              <p className="text-[9px] text-white/40 uppercase font-bold mt-1">
                Order #7x2a • +233 24 000 0000
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-3 py-1 rounded-full">
              Delivered
            </span>
            <CheckCheck size={16} className="text-emerald-500 opacity-40" />
          </div>
        </div>

        {/* Placeholder for empty logs */}
        <div className="py-20 text-center opacity-10 border-2 border-dashed border-white/10 rounded-[3rem]">
          <Send size={48} className="mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">
            Live Dispatch Feed Active
          </p>
        </div>
      </div>
    </div>
  );
}
