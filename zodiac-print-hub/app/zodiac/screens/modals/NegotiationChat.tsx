"use client";

import { useState } from "react";

export function NegotiationChat({
  negotiation,
}: {
  negotiation: B2BNegotiation;
}) {
  const [msg, setMsg] = useState("");
  const [offer, setOffer] = useState(negotiation.currentOffer);

  const sendCounterOffer = () => {
    console.log(`Bargaining: New offer of ₵${offer}`);
    // Feature 15.15: Logic to push new price to partner
  };

  return (
    <div className="glass-card flex flex-col h-[500px] w-full max-w-md border-cyan-500/20 overflow-hidden">
      {/* Header with Current Bargain */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-cyan-400/5">
        <div>
          <h3 className="text-sm font-bold">Modern Press GH</h3>
          <p className="text-[10px] opacity-40 italic uppercase">
            Negotiating Production Cost
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-50 uppercase">Current Offer</p>
          <p className="text-lg font-mono font-bold text-cyan-400">₵{offer}</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {negotiation.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] p-3 rounded-2xl text-xs ${
              m.senderId === "ME"
                ? "bg-cyan-500 text-black self-end"
                : "bg-white/5 text-white self-start"
            }`}
          >
            {m.isOffer && (
              <p className="font-bold mb-1 border-b border-black/10 pb-1">
                Counter Offer: ₵{m.offerAmount}
              </p>
            )}
            {m.text}
          </div>
        ))}
      </div>

      {/* Bargain Control (Feature 15.15) */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="number"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-400"
            placeholder="New Offer ₵..."
            onChange={(e) => setOffer(Number(e.target.value))}
          />
          <button
            onClick={sendCounterOffer}
            className="px-4 py-2 bg-white/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded-xl uppercase tracking-tighter hover:bg-cyan-500 hover:text-black transition-all"
          >
            Counter
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest active:scale-95">
            Accept ₵{offer}
          </button>
        </div>
      </div>
    </div>
  );
}
