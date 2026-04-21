"use client";

import { useState } from "react";
import { useModalStore } from "@store/useModalStore";

export function B2BBlindPushModal({ jobSpecs }: { jobSpecs: string }) {
  const [bargainPrice, setBargainPrice] = useState("");
  const [selectedFirm, setSelectedFirm] = useState("");

  const PARTNER_FIRMS = [
    { id: "F1", name: "Modern Press GH", rating: 4.8, distance: "2km" },
    { id: "F2", name: "Osu Large Format Hub", rating: 4.5, distance: "5km" },
  ];

  return (
    <div className="glass-card p-6 w-full max-w-sm border-cyan-500/40 animate-in slide-in-from-bottom-4">
      <h2 className="text-xl font-bold mb-1">B2B Blind Push</h2>
      <p className="text-[10px] opacity-50 uppercase tracking-widest mb-6">
        Outsource without price exposure
      </p>

      {/* FIRM SELECTION */}
      <div className="flex flex-col gap-3 mb-6">
        <label className="text-[10px] font-bold opacity-40 uppercase">
          Select Partner Firm
        </label>
        {PARTNER_FIRMS.map((firm) => (
          <div
            key={firm.id}
            onClick={() => setSelectedFirm(firm.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
              selectedFirm === firm.id
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-white/5 bg-white/5"
            }`}
          >
            <div>
              <p className="text-sm font-bold">{firm.name}</p>
              <p className="text-[10px] opacity-40">
                ⭐ {firm.rating} • {firm.distance} away
              </p>
            </div>
            {selectedFirm === firm.id && (
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
            )}
          </div>
        ))}
      </div>

      {/* THE BARGAIN (Feature 15.15) */}
      <div className="flex flex-col gap-1 mb-6">
        <label className="text-[10px] font-bold opacity-40 uppercase">
          Your Offer (GHS)
        </label>
        <input
          type="number"
          placeholder="Enter production cost offer..."
          className="bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-cyan-400 outline-none focus:border-cyan-400"
          onChange={(e) => setBargainPrice(e.target.value)}
        />
      </div>

      <div className="p-4 bg-white/5 rounded-2xl mb-6 italic text-[11px] opacity-70 border-l-2 border-cyan-400">
        "Hello {selectedFirm ? "Modern Press" : "Partner"}, we have a
        high-priority Large Format job. View the technical specs attached and
        let us know if you can fulfill this at our proposed production rate."
      </div>

      <button
        disabled={!selectedFirm || !bargainPrice}
        className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-30"
      >
        Push Work Privately
      </button>
    </div>
  );
}
