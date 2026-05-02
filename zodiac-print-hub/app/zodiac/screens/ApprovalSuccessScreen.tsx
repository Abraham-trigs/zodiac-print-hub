"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Printer, Clock, Download, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { JobReceipt } from "@components/print/JobReceipt"; // Assuming this is the path

export function ApprovalSuccessScreen({ token }: { token: string }) {
  const [job, setJob] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetch(`/api/public/approve/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22d3ee", "#06b6d4", "#ffffff"],
        });
      });
  }, [token]);

  if (!job) return null;

  // 🚀 Logic to swap view to the printable Receipt
  if (showReceipt) {
    return <JobReceipt job={job} payments={job.payments || []} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* --- AESTHETIC NODES --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full opacity-50" />

      {/* --- SUCCESS CARD --- */}
      <div className="max-w-md w-full z-10 animate-in zoom-in-95 duration-700">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          Production Authorized
        </h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10 px-8 leading-relaxed">
          Your design proof has been locked and the payment was verified by
          Paystack.
        </p>

        {/* --- RECEIPT BOX --- */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6 mb-8 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="text-left">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
                Order Ref
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">
                {job.shortRef}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">
                Status
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase">
                In Queue
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">
                Service
              </span>
              <span className="text-[10px] font-black uppercase text-white/80">
                {job.serviceName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase">
                Total Paid
              </span>
              <span className="text-lg font-black font-mono">
                ₵{job.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center gap-3 justify-center">
            <Printer size={14} className="text-cyan-400 opacity-40" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
              Node Processing V2.0
            </span>
          </div>
        </div>

        {/* --- NEXT STEPS HUD --- */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <button
            onClick={() => setShowReceipt(true)}
            className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group"
          >
            <Download
              size={14}
              className="opacity-40 group-hover:opacity-100"
            />
            <span className="text-[9px] font-black uppercase">Receipt</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group">
            <Share2 size={14} className="opacity-40 group-hover:opacity-100" />
            <span className="text-[9px] font-black uppercase">Track</span>
          </button>
        </div>

        {/* --- ESTIMATED READY --- */}
        <div className="flex items-center gap-3 justify-center text-emerald-400/60 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">
          <Clock size={14} />
          Est. Collection: 24 - 48 Hours
        </div>
      </div>

      <footer className="mt-20 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[8px] font-black uppercase tracking-[0.6em]">
          Powered by Zodiac Industrial Node
        </p>
      </footer>
    </div>
  );
}
