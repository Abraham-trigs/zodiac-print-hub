"use client";
import { useZodiac } from "@store/zodiac.store";
import { useModalStore } from "@store/useModalStore";
import { ZodiacScreen } from "@types/screen.types";
import { SettingsPermissionsModal } from "@modals/SettingsPermissionsModal";
import { PrintLayoutConfigModal } from "@workstation/production/PrintLayoutConfigModal";
import { useDataStore } from "@store-core/useDataStore";
// import { selectProductionIntelligence } from "@store-selectors/data.selectors";

export const HubMenuScreen: ZodiacScreen = {
  id: "HUB_MENU",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { openModal } = useModalStore();

    // 🧠 LIVE BRAIN: Pull the waste tip from actual shop data
    const intel = useDataStore(selectProductionIntelligence);

    const handleMenuClick = (id: string) => {
      // 1. GLOBAL MODALS (Technical Overlays)
      if (id === "SETTINGS")
        return openModal("GLOBAL", SettingsPermissionsModal);
      if (id === "SHOOTER_CONFIG")
        return openModal("GLOBAL", PrintLayoutConfigModal);

      // 2. SCREEN NAVIGATION (Core Flow)
      setScreen(id as any);
    };

    const menuItems = [
      /* --- FINANCIAL & INTEL --- */
      {
        id: "FINANCE_HUB", // 🚀 NEW
        label: "Finance Hub",
        icon: "💎",
        desc: "P&L and Net Profit",
      },
      {
        id: "ANALYTICS",
        label: "Staff Leaderboard",
        icon: "🏆",
        desc: "Velocity & Yield KPIs",
      },

      /* --- CORE PRODUCTION --- */
      {
        id: "PRICE_ENTRY_CENTER",
        label: "Price Config",
        icon: "💰",
        desc: "Service & Material Specs",
      },
      {
        id: "STOCK_MGMT",
        label: "Inventory Logic",
        icon: "📦",
        desc: "Audit Trail & Ledger",
      },

      /* --- SUPPLY CHAIN NODE --- */
      {
        id: "SUPPLY_NODE",
        label: "Supply Node",
        icon: "🛒",
        desc: "Shortfalls & Velocity",
      },
      {
        id: "RECEIVING_NODE",
        label: "Receiving Port",
        icon: "🚚",
        desc: "Check-in Shipments",
      },
      {
        id: "SUPPLIER_REGISTRY",
        label: "Supplier Vault",
        icon: "🏢",
        desc: "Verified Providers",
      },

      /* --- LAST-MILE LOGISTICS --- */
      {
        id: "FRONT_DESK_CLEARANCE", // 🚀 NEW (Recommended step)
        label: "Clearance Node",
        icon: "⚡",
        desc: "ShortRef Pickup & POD",
      },
      {
        id: "DISPATCH_BOARD", // 🚀 NEW
        label: "Dispatch Board",
        icon: "🛵",
        desc: "Fleet & Rider Management",
      },

      /* --- SYSTEM CONFIG --- */
      {
        id: "SHOOTER_CONFIG",
        label: "Machine & Layout",
        icon: "🖨️",
        desc: "Bleeds & Roll Margins",
      },
      {
        id: "SETTINGS",
        label: "Global Settings",
        icon: "🛡️",
        desc: "Org Profile & Security",
      },
    ];

    return (
      <div className="flex flex-col h-full gap-8 animate-in fade-in zoom-in-95 duration-500">
        <header>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">
            Zodiac Core
          </h2>
          <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black">
            Industrial Operating System
          </p>
        </header>

        {/* High-density Scrollable Menu */}
        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1 custom-scrollbar pb-10">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="glass-card p-4 flex items-center gap-5 border border-white/5 hover:border-cyan-400/30 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="text-xl bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20 transition-all">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">
                  {item.label}
                </span>
                <span className="text-[8px] opacity-30 font-bold uppercase tracking-tight group-hover:opacity-60">
                  {item.desc}
                </span>
              </div>
              <span className="ml-auto opacity-10 group-hover:opacity-100 group-hover:text-cyan-400 transition-all font-black text-xs">
                →
              </span>
            </div>
          ))}
        </div>

        {/* 🚀 DYNAMIC INTELLIGENCE TIP */}
        <div
          className={`mt-auto p-5 border rounded-[2rem] transition-all duration-1000 ${
            intel.margin < 20
              ? "bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/5"
              : "bg-emerald-500/5 border-emerald-500/10"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${intel.margin < 20 ? "bg-red-500" : "bg-emerald-500"}`}
            />
            <p className="text-[9px] font-black uppercase tracking-tighter leading-none opacity-40">
              System Insight
            </p>
          </div>
          <p
            className={`text-[11px] font-bold italic leading-snug ${intel.margin < 20 ? "text-red-400" : "text-emerald-400"}`}
          >
            {intel.margin < 20
              ? `⚠️ Financial Leakage Detected: Production efficiency is currently ${intel.margin.toFixed(1)}%.`
              : `✓ Node health verified. Monthly production margin stabilized at ${intel.margin.toFixed(1)}%.`}
          </p>
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
