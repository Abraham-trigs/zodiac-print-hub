"use client";

import { useZodiac } from "../store/zodiac.store";
import { ZodiacScreen } from "../types/screen.types";

export const UserProfileScreen: ZodiacScreen = {
  id: "USER_PROFLE",
  layoutMode: "DETAIL",
  TopComponent: () => {
    const { setScreen } = useZodiac();

    return (
      <div className="flex flex-col h-full gap-6">
        {/* 1. Header Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-400/30 overflow-hidden bg-blue-900">
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-50">
              👤
            </div>
          </div>
          <h2 className="text-xl font-bold">Abraham Mensah</h2>
          <span className="text-cyan-400 text-xs uppercase tracking-tighter">
            Premium Print Member
          </span>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card flex flex-col items-center p-3">
            <span className="text-[10px] opacity-60">Total Prints</span>
            <span className="text-lg font-bold">142</span>
          </div>
          <div className="glass-card flex flex-col items-center p-3">
            <span className="text-[10px] opacity-60">Wallet Bal.</span>
            <span className="text-lg font-bold text-orange-400">₵85.00</span>
          </div>
        </div>

        {/* 3. Settings List */}
        <div className="flex flex-col gap-2 mt-4 overflow-y-auto">
          {[
            { label: "Subscription", icon: "✨", id: "SUBSCRIPTION" },
            { label: "Notification Settings", icon: "🔔" },
            { label: "Payment Methods", icon: "💳" },
            { label: "Security & Privacy", icon: "🔒" },
            { label: "Help & Support", icon: "🎧" },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => item.id && setScreen(item.id as any)}
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span
                  className={item.id === "SUBSCRIPTION" ? "text-cyan-400" : ""}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-sm ${item.id === "SUBSCRIPTION" ? "font-bold text-cyan-400" : ""}`}
                >
                  {item.label}
                </span>
              </div>
              <span className="opacity-30 text-xs">→</span>
            </div>
          ))}
        </div>

        {/* 4. NEW NAVIGATOR BUTTON (Talks to Store) */}
        <div className="mt-auto pb-4 px-2">
          <button
            onClick={() => setScreen("WELCOME")}
            className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all active:scale-95"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  },
  DownComponent: undefined,
};
