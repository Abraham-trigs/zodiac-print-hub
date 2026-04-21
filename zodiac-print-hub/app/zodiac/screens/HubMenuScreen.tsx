"use client";

import { useZodiac } from "../store/zodiac.store";
import { useModalStore } from "../store/useModalStore";
import { ZodiacScreen } from "../types/screen.types";
import { PriceListModal } from "../screens/modals/priceListModal";
import { SettingsPermissionsModal } from "../screens/modals/SettingsPermissionsModal"; // ✅ Import new modal

export const HubMenuScreen: ZodiacScreen = {
  id: "HUB_MENU",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen } = useZodiac();
    const { openModal } = useModalStore();

    const handleMenuClick = (id: string) => {
      if (id === "PRICE_LIST") {
        openModal("GLOBAL", PriceListModal);
      } else if (id === "SETTINGS") {
        // 🔥 Trigger Settings & Permissions Modal
        openModal("GLOBAL", SettingsPermissionsModal);
      } else {
        setScreen(id as any);
      }
    };

    const menuItems = [
      {
        id: "ANALYTICS",
        label: "Business Analytics",
        icon: "📈",
        desc: "Revenue & Waste",
      },
      {
        id: "STAFF_MGMT",
        label: "Staff Oversight",
        icon: "👥",
        desc: "Load & Performance",
      },
      {
        id: "PRICE_LIST",
        label: "Price Config",
        icon: "💰",
        desc: "Market Benchmarks",
      },
      {
        id: "STOCK_MGMT",
        label: "Inventory Logic",
        icon: "📦",
        desc: "Stock Thresholds",
      },
      {
        id: "SETTINGS",
        label: "Settings & Permissions", // ✅ Updated label
        icon: "🛡️",
        desc: "Permissions & Global Keys", // ✅ New Menu Item
      },
    ];

    return (
      <div className="flex flex-col h-full gap-8 animate-in fade-in zoom-in-95 duration-300">
        <header>
          <h2 className="text-3xl font-black tracking-tighter">
            Control Center
          </h2>
          <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-bold">
            Insight & Configuration
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="glass-card p-5 flex items-center gap-5 border-white/5 hover:border-cyan-400/30 bg-white/5 transition-all cursor-pointer group active:scale-95"
            >
              <div className="text-3xl bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-cyan-400/10">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">
                  {item.label}
                </span>
                <span className="text-[10px] opacity-40">{item.desc}</span>
              </div>
              <span className="ml-auto opacity-20 group-hover:opacity-100 group-hover:text-cyan-400">
                →
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
          <p className="text-[9px] text-orange-200 leading-relaxed italic text-center">
            💡 <strong>Management Tip:</strong> Weekly material waste is
            currently at 4.2%.
          </p>
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
