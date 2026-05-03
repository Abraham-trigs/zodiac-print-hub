"use client";

import {
  CheckCircle,
  XCircle,
  CreditCard,
  MessageSquare,
  Download,
} from "lucide-react";
import { useState } from "react";

export function CustomerPortal({ job }: { job: any }) {
  const [feedback, setFeedback] = useState("");
  const [view, setView] = useState<"PROOF" | "PAYMENT">("PROOF");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      {/* --- TOP NAV --- */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xs">
            Z
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Review Node
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase">
            Order #{job.shortRef || job.id.slice(-6).toUpperCase()}
          </p>
          <p className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest">
            Awaiting Approval
          </p>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        {/* --- ARTWORK PREVIEW --- */}
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

          <div className="glass-card overflow-hidden border-white/10 bg-white/[0.02] rounded-[2rem] shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="text-[9px] font-black uppercase opacity-40">
                Digital Proof 01
              </span>
              <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                <Download size={16} />
              </button>
            </div>

            {/* The Image */}
            <div className="aspect-video bg-black/40 flex items-center justify-center p-8">
              {job.proofUrl ? (
                <img
                  src={job.proofUrl}
                  alt="Proof"
                  className="max-h-full object-contain shadow-2xl"
                />
              ) : (
                <div className="text-center opacity-20">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase">
                    Proof Processing...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ACTIONS PANEL --- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Feedback */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">
              Request Changes
            </h3>
            <textarea
              placeholder="Type any revisions here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-white/20 transition-all resize-none"
            />
            <button className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400 hover:text-red-300 transition-all">
              <XCircle size={14} /> Send Revision Request
            </button>
          </div>

          {/* Right: Approval & Payment */}
          <div className="p-8 bg-cyan-400 rounded-[2.5rem] text-black flex flex-col justify-between shadow-2xl shadow-cyan-400/20">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">
                Looks Perfect?
              </h3>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-tight mt-1">
                Approve design to start production
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-end border-b border-black/10 pb-4">
                <span className="text-[10px] font-black uppercase opacity-60">
                  Total Due
                </span>
                <span className="text-3xl font-black font-mono tracking-tighter">
                  ₵{job.totalPrice.toFixed(2)}
                </span>
              </div>

              <button className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                <CreditCard size={18} />
                Approve & Pay Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="p-12 border-t border-white/5 text-center">
        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.5em]">
          Powered by Zodiac Node • Secure End-to-End Encryption
        </p>
      </footer>
    </div>
  );
}
