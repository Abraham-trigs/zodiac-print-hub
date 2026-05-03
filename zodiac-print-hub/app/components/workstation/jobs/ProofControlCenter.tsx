"use client";

import { useState } from "react";
import {
  CloudUpload,
  ExternalLink,
  CheckCircle2,
  Share2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { apiClient } from "@lib/client/api/client";

export function ProofControlCenter({ job }: { job: any }) {
  const [isUploading, setIsUploading] = useState(false);

  // 🔗 The Public URL for the Customer Portal
  const approvalLink = `${window.location.origin}/approve/${job.approvalToken}`;

  const handleShare = () => {
    const message = `Hi ${job.client?.name}, your design proof for Order #${job.shortRef} is ready for review: ${approvalLink}`;
    window.open(
      `https://wa.me{job.client?.phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 space-y-6">
      <header className="flex justify-between items-center px-1">
        <div>
          <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
            Artwork Proofing
          </h4>
          <p className="text-[8px] text-white/30 font-bold uppercase mt-1">
            Status: {job.proofStatus}
          </p>
        </div>
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${job.proofStatus === "APPROVED" ? "bg-emerald-500" : "bg-orange-500"}`}
        />
      </header>

      {/* --- PREVIEW / UPLOAD AREA --- */}
      <div className="aspect-video bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center group hover:border-cyan-400/30 transition-all cursor-pointer overflow-hidden relative">
        {job.proofUrl ? (
          <>
            <img
              src={job.proofUrl}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/60">
              <button className="px-4 py-2 bg-white text-black font-black uppercase text-[8px] rounded-lg">
                Replace Proof
              </button>
            </div>
          </>
        ) : (
          <>
            <CloudUpload
              className="text-white/10 group-hover:text-cyan-400 transition-colors mb-3"
              size={32}
            />
            <span className="text-[9px] font-black uppercase text-white/20 group-hover:text-white transition-colors">
              Click to Upload JPG/PNG
            </span>
          </>
        )}
      </div>

      {/* --- ACTION BAR --- */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleShare}
          disabled={!job.proofUrl}
          className="py-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all disabled:opacity-20"
        >
          <Share2 size={14} />
          <span className="text-[9px] font-black uppercase">
            Send to Client
          </span>
        </button>

        <button
          onClick={() => window.open(approvalLink, "_blank")}
          className="py-3 bg-cyan-400 text-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ExternalLink size={14} />
          <span className="text-[9px] font-black uppercase">
            Preview Portal
          </span>
        </button>
      </div>

      {/* --- FEEDBACK SNIPPET --- */}
      {job.customerNote && (
        <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
          <span className="text-[7px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={10} /> Client Feedback
          </span>
          <p className="text-[10px] text-white/70 italic mt-2 leading-relaxed">
            "{job.customerNote}"
          </p>
        </div>
      )}
    </div>
  );
}
