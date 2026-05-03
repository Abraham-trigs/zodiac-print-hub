"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Download,
  MessageSquare,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import { apiClient } from "@lib/client/api/client";
import { format } from "date-fns";

export function CustomerApprovalScreen({ token }: { token: string }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revisionNote, setRevisionNote] = useState("");
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

  // 1. FETCH PUBLIC JOB DATA
  useEffect(() => {
    fetch(`/api/public/approve/${token}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async () => {
    setStatus("IDLE");
    try {
      await fetch(`/api/public/approve/${token}/confirm`, { method: "POST" });
      setStatus("SUCCESS");
      // 🚀 Redirect to Payment Gateway or show success
    } catch (e) {
      setStatus("ERROR");
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote) return;
    await fetch(`/api/public/approve/${token}/revision`, {
      method: "POST",
      body: JSON.stringify({ note: revisionNote }),
    });
    alert("Revision request sent to the design team.");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center animate-pulse text-cyan-400 font-black uppercase text-[10px] tracking-[0.5em]">
        Establishing Secure Node...
      </div>
    );
  if (!job)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/20 uppercase font-black text-xs">
        Invalid or Expired Link
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-cyan-500/30">
      {/* --- TOP HUD --- */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap size={18} className="text-black" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] block leading-none">
              Review Node
            </span>
            <span className="text-[8px] text-white/20 font-bold uppercase mt-1 block">
              Ref: {job.shortRef}
            </span>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
          <Lock size={10} className="text-emerald-500" />
          <span className="text-[8px] font-black uppercase text-white/40">
            Secure End-to-End
          </span>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* --- LEFT: THE ARTWORK --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card overflow-hidden border-white/10 bg-white/[0.02] rounded-[2.5rem] shadow-3xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-white/60">
                  V1.0 Final Digital Proof
                </span>
              </div>
              <a
                href={job.proofUrl}
                download
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
              >
                <Download size={18} className="text-cyan-400" />
              </a>
            </div>

            <div className="aspect-[4/3] md:aspect-video bg-black/40 p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
              {/* Aesthetic Background Glow */}
              <div className="absolute inset-0 bg-cyan-500/5 blur-[120px] rounded-full opacity-30" />

              {job.proofUrl ? (
                <img
                  src={job.proofUrl}
                  alt="Design Proof"
                  className="max-h-full max-w-full object-contain shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-lg z-10"
                />
              ) : (
                <div className="text-center opacity-10 py-20">
                  <CheckCircle size={80} className="mx-auto mb-6" />
                  <p className="text-xl font-black uppercase italic">
                    Processing High-Res Preview...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.01] rounded-[2rem]">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <MessageSquare size={14} /> Design Feedback
            </h3>
            <textarea
              placeholder="Request specific changes (e.g., 'Change text to red', 'Move logo up')..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-medium outline-none focus:border-cyan-400/40 transition-all resize-none placeholder:text-white/10"
            />
            <button
              onClick={handleRequestRevision}
              className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-red-400 hover:text-red-300 transition-all"
            >
              <XCircle size={14} /> Submit Revision Request
            </button>
          </div>
        </div>

        {/* --- RIGHT: THE ACTION HUB --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-10 bg-cyan-400 rounded-[3rem] text-black shadow-2xl shadow-cyan-400/20 sticky top-32 transition-transform hover:scale-[1.01]">
            <header className="mb-10">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">
                Authorize Production
              </h3>
              <p className="text-[11px] font-bold opacity-70 uppercase tracking-tight mt-2">
                Design review complete
              </p>
            </header>

            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-black/10 pb-6">
                <span className="text-[10px] font-black uppercase opacity-60">
                  Total Commitment
                </span>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono tracking-tighter block leading-none">
                    ₵{job.totalPrice.toFixed(2)}
                  </span>
                  <span className="text-[8px] font-black uppercase opacity-40">
                    Inc. VAT & Materials
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase text-[11px] flex items-center justify-center gap-3 hover:bg-zinc-900 active:scale-95 transition-all shadow-xl"
                >
                  <CreditCard size={18} />
                  Confirm & Pay Now
                </button>
                <p className="text-[8px] text-center font-bold opacity-40 uppercase px-4 leading-relaxed">
                  By clicking approve, you authorize the production of this
                  design as shown above.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.02] rounded-[2.5rem]">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-4">
              Service Package
            </span>
            <p className="text-[11px] font-black uppercase">
              {job.serviceName}
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-500/60 font-black text-[9px] uppercase">
              <ShieldCheck size={12} /> Satisfaction Guaranteed
            </div>
          </div>
        </div>
      </main>

      <footer className="p-12 border-t border-white/5 text-center mt-12 bg-black/40">
        <p className="text-[9px] font-black uppercase text-white/10 tracking-[0.6em]">
          Powered by Zodiac Industrial OS • v2.0 Node
        </p>
      </footer>
    </div>
  );
}
