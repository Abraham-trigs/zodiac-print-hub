"use client";

import { useZodiac } from "../store/zodiac.store";

export function BottomBar() {
  const setScreen = useZodiac((s) => s.setScreen);

  return (
    <nav className="zodiac-bottombar px-8">
      {/* 1. Messages */}
      <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
        <div className="text-2xl grayscale brightness-200">💬</div>
        <div className="badge">2</div>
      </div>

      {/* 2. Home */}
      <div
        className="cursor-pointer text-3xl transition-transform active:scale-90"
        onClick={() => setScreen("WELCOME")}
      >
        🏠
      </div>

      {/* 3. HUB / INSIGHTS (New - Before Cart) */}
      <div
        className="cursor-pointer text-3xl transition-transform active:scale-95 opacity-60 hover:opacity-100 hover:text-cyan-400"
        onClick={() => setScreen("HUB_MENU")}
      >
        📱
      </div>

      {/* 4. Cart (Job Manager) */}
      <div
        className="relative cursor-pointer p-2 border-2 border-orange-500 rounded-full bg-blue-900/50 transition-transform active:scale-90"
        onClick={() => setScreen("JOB_CART")}
      >
        <div className="text-2xl">🛒</div>
        <div className="badge">5</div>
      </div>
    </nav>
  );
}
