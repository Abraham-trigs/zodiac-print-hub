"use client";

import {
  Layers,
  Zap,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Cog,
  Database,
  Network,
} from "lucide-react";

const NODES = [
  {
    id: "intake",
    title: "Intake Node",
    icon: <Database size={20} />,
    color: "cyan",
    desc: "Triple-Price Validation logic ensuring every quote accounts for Material, Labor, and Profit margins.",
    specs: [
      "CUID Order Identity",
      "Variable Logic Engine",
      "Automated Job Carding",
    ],
  },
  {
    id: "logic",
    title: "Logic Node",
    icon: <Cpu size={20} />,
    color: "purple",
    desc: "The Brain: Predictive Velocity analytics calculating roll runway and triggering JIT procurement.",
    specs: [
      "Velocity Burn Rates",
      "Lead-Time Awareness",
      "Auto-Shortfall Detection",
    ],
  },
  {
    id: "physical",
    title: "Physical Node",
    icon: <Cog size={20} />,
    color: "emerald",
    desc: "Production orchestration using our Nesting Builder to optimize material yield and minimize offcuts.",
    specs: [
      "Yield Percentage Scoring",
      "Linear Stock Deduction",
      "Machine Bleed Config",
    ],
  },
  {
    id: "audit",
    title: "Audit Node",
    icon: <ShieldCheck size={20} />,
    color: "orange",
    desc: "The Financial Ledger: Quantifying material leakage and providing real-time P&L visibility.",
    specs: [
      "Leakage Value Tracking",
      "Digital POD Handshake",
      "Remittance Auditing",
    ],
  },
];

export function SolutionsContent() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <Network className="text-zodiac-cyan" size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
            Technical Blueprint v2.0
          </span>
        </div>
        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
          Universal <br /> <span className="text-zodiac-cyan">Workflow</span>{" "}
          Node
        </h2>
      </header>

      <div className="relative border-l border-white/5 ml-4 pl-12 space-y-24">
        {NODES.map((node, i) => (
          <div key={node.id} className="relative group">
            {/* The Circuit Connector */}
            <div className="absolute -left-[53px] top-0 w-2.5 h-2.5 rounded-full bg-white/10 group-hover:bg-zodiac-cyan transition-colors duration-500 border-2 border-[#0A0A0A] z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* CONTENT */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 group-hover:text-zodiac-cyan transition-colors`}
                  >
                    {node.icon}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">
                    {node.title}
                  </h3>
                </div>
                <p className="text-lg text-white/40 font-medium leading-relaxed mb-6">
                  {node.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {node.specs.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-[8px] font-black uppercase tracking-widest text-white/20"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* VISUAL PREVIEW BLOCK */}
              <div className="lg:col-span-5">
                <div className="glass-card aspect-[16/9] rounded-[2rem] border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all">
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-zodiac-cyan to-transparent" />
                  <Layers
                    size={48}
                    className="opacity-10 group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Simulated terminal data */}
                  <div className="absolute bottom-4 left-6 font-mono text-[6px] text-white/10 uppercase tracking-widest">
                    SEC_0x{i + 1}_NODE_STABLE
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CALL TO ACTION --- */}
      <div className="mt-32 p-12 bg-zodiac-cyan rounded-[3rem] text-black flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-zodiac-cyan/20">
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">
            Ready to Initialize?
          </h3>
          <p className="text-sm font-bold opacity-70 uppercase tracking-tight">
            Deploy the Zodiac Node to your workshop today.
          </p>
        </div>
        <button className="mt-8 md:mt-0 px-10 py-5 bg-black text-white rounded-full font-black uppercase text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl">
          Request Implementation <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
