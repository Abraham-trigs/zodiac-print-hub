"use client";

import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";
import { SettingsPermissionsModal } from "../screens/modals/SettingsPermissionsModal";
import { PrintLayoutConfigModal } from "../components/workstation/production/PrintLayoutConfigModal"; // 🚀 Added
import { useDataStore } from "../store/core/useDataStore";
import { selectProductionIntelligence } from "../store/selectors/data.selectors";

export const HubMenuScreen: ZodiacScreen = {
  id: "HUB_MENU",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { openModal } = useModalStore();

    // 🧠 LIVE BRAIN: Pull the waste tip from actual shop data
    const intel = useDataStore(selectProductionIntelligence);

    const handleMenuClick = (id: string) => {
      // 1. GLOBAL MODALS (Non-navigation actions)
      if (id === "SETTINGS") {
        return openModal("GLOBAL", SettingsPermissionsModal);
      }
      if (id === "SHOOTER_CONFIG") {
        return openModal("GLOBAL", PrintLayoutConfigModal);
      }

      // 2. SCREEN NAVIGATION (Must match keys in SCREEN_MAP)
      setScreen(id as any);
    };

    const menuItems = [
      {
        id: "ANALYTICS",
        label: "Production Intel",
        icon: "📊",
        desc: "Margins & Leakage",
      },
      {
        id: "PRICE_ENTRY_CENTER",
        label: "Price Config",
        icon: "💰",
        desc: "Workstation Entry",
      },
      {
        id: "STOCK_MGMT",
        label: "Inventory Logic",
        icon: "📦",
        desc: "Audit Trail & Ledger",
      },
      {
        id: "SUPPLY_NODE", // 🚀 Phase 2 Entry
        label: "Supply Node",
        icon: "🛒",
        desc: "Shortfalls & Reorders",
      },
      {
        id: "SUPPLIER_REGISTRY", // 🚀 Phase 1 Entry
        label: "Supplier Vault",
        icon: "🏢",
        desc: "Verified Providers",
      },
      {
        id: "RECEIVING_NODE", // 🚀 Phase 3 Entry
        label: "Receiving Port",
        icon: "🚚",
        desc: "Check-in Shipments",
      },
      {
        id: "SHOOTER_CONFIG",
        label: "Machine & Layout",
        icon: "🖨️",
        desc: "Bleeds & Roll Margins",
      },
      {
        id: "STAFF_MGMT",
        label: "Staff Oversight",
        icon: "👥",
        desc: "Load & Performance",
      },
      {
        id: "SETTINGS",
        label: "Global Settings",
        icon: "🛡️",
        desc: "Keys & Permissions",
      },
    ];

    return (
      <div className="flex flex-col h-full gap-8 animate-in fade-in zoom-in-95 duration-300">
        <header>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">
            Control Center
          </h2>
          <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black">
            Systems Management Node
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="glass-card p-5 flex items-center gap-5 border border-white/5 hover:border-cyan-400/30 bg-white/5 transition-all cursor-pointer group active:scale-[0.95]"
            >
              <div className="text-2xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20 transition-all">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">
                  {item.label}
                </span>
                <span className="text-[9px] opacity-30 font-bold uppercase tracking-tight group-hover:opacity-60">
                  {item.desc}
                </span>
              </div>
              <span className="ml-auto opacity-10 group-hover:opacity-100 group-hover:text-cyan-400 transition-all font-black">
                →
              </span>
            </div>
          ))}
        </div>

        {/* 🚀 DYNAMIC INTELLIGENCE TIP */}
        <div
          className={`mt-auto p-5 border rounded-[2rem] transition-all duration-1000 ${
            intel.margin < 20
              ? "bg-red-500/10 border-red-500/20"
              : "bg-cyan-500/5 border-cyan-500/10"
          }`}
        >
          <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-2">
            Node Insight:
          </p>
          <p
            className={`text-[11px] font-bold italic ${intel.margin < 20 ? "text-red-400" : "text-cyan-400"}`}
          >
            {intel.margin < 20
              ? `⚠️ Low Margin Alert: Shop currently operating at ${intel.margin.toFixed(1)}% efficiency.`
              : `✓ Shop health stable. Current production margin is ${intel.margin.toFixed(1)}%.`}
          </p>
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
