"use client";

import { Check, Zap, ShieldCheck, Globe, Cpu, ArrowRight } from "lucide-react";
import { HandshakeButton } from "../HandshakeButton";

const TIERS = [
  {
    id: "starter",
    name: "Starter Node",
    price: "₵1,500",
    desc: "Essential tracking for growing shops.",
    features: [
      "Up to 5 Staff Members",
      "Basic Inventory Ledger",
      "Manual Job Entry",
      "Standard P&L Reports",
    ],
    accent: "white/20",
    btnVariant: "secondary" as const,
  },
  {
    id: "industrial",
    name: "Industrial Node",
    price: "₵3,500",
    desc: "Full automation and supply chain intelligence.",
    features: [
      "Unlimited Staff",
      "Predictive Velocity & JIT Buying",
      "Automated Nesting & Yield Scores",
      "WhatsApp Automation Node",
      "Supplier & Client Portals",
    ],
    accent: "cyan-400",
    isHero: true,
    btnVariant: "primary" as const,
  },
  {
    id: "sovereign",
    name: "Sovereign Node",
    price: "Custom",
    desc: "The ultimate enterprise installation.",
    features: [
      "On-Premise Deployment",
      "Full White-Label Branding",
      "Custom Print Bleed Logic",
      "Dedicated Support Node",
      "Multi-Org Management",
    ],
    accent: "purple-500",
    btnVariant: "secondary" as const,
  },
];

export function PricingContent() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* --- HEADER --- */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 mb-6">
          <Cpu size={14} className="text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
            Licensing Matrix v2.0
          </span>
        </div>
        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">
          Scalable <span className="text-cyan-400">Power</span>
        </h2>
        <p className="text-white/30 text-sm font-medium max-w-md mx-auto">
          Choose the node capacity that matches your workshop's production
          velocity.
        </p>
      </header>

      {/* --- TIERS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`
              relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 border
              ${
                tier.isHero
                  ? "bg-[#0A0A0A] border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.05)] scale-105 z-10 h-[650px]"
                  : "bg-white/[0.01] border-white/5 h-[580px] hover:border-white/10"
              }
            `}
          >
            {tier.isHero && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-400 text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                Recommended Node
              </div>
            )}

            <div className="mb-10">
              <h3
                className={`text-xl font-black uppercase italic tracking-tight mb-2 ${tier.isHero ? "text-cyan-400" : "text-white/60"}`}
              >
                {tier.name}
              </h3>
              <p className="text-[10px] text-white/30 uppercase font-bold leading-relaxed">
                {tier.desc}
              </p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono tracking-tighter">
                  {tier.price}
                </span>
                {tier.price !== "Custom" && (
                  <span className="text-xs font-bold text-white/20 uppercase">
                    / Month
                  </span>
                )}
              </div>
            </div>

            {/* FEATURES LIST */}
            <div className="flex-1 space-y-5">
              {tier.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div
                    className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center border ${tier.isHero ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/5"}`}
                  >
                    <Check
                      size={10}
                      className={
                        tier.isHero ? "text-cyan-400" : "text-white/40"
                      }
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors">
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <HandshakeButton
                label={
                  tier.id === "sovereign" ? "Contact Sales" : "Authorize Node"
                }
                variant={tier.btnVariant}
                className="w-full justify-center py-5"
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- FOOTER TRUST --- */}
      <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 opacity-20 grayscale hover:opacity-40 transition-all duration-1000">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} />{" "}
          <span className="text-[10px] font-black uppercase tracking-widest">
            Secured by Zodiac Core
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={20} />{" "}
          <span className="text-[10px] font-black uppercase tracking-widest">
            Global Logistics Standards
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Zap size={20} />{" "}
          <span className="text-[10px] font-black uppercase tracking-widest">
            Instant Node Activation
          </span>
        </div>
      </div>
    </div>
  );
}
