"use client";

import { useZodiac } from "../store/zodiac.store";

export function PrimaryActionButton() {
  const action = useZodiac((s) => s.sharedAction);
  const viewMode = useZodiac((s) => s.viewMode);

  if (!action) return null;

  const execute = () => {
    useZodiac.getState().executeSharedAction();
  };

  const icon =
    (action as any).icon ??
    (action.isBack ? "←" : viewMode === "SPLIT" ? "↑" : "↓");

  const borderColor = action.isBack ? "white" : "var(--zodiac-orange)";

  return (
    <button
      onClick={execute}
      className="glass-card flex items-center gap-3 active:scale-95 transition-all duration-200 group"
      style={{
        cursor: "pointer",
        color: "var(--zodiac-cyan)",
        borderColor,
      }}
    >
      <span className="font-bold tracking-widest uppercase text-[11px]">
        {action.label}
      </span>

      <div className="flex items-center justify-center bg-white/10 rounded-full w-5 h-5 group-hover:bg-white/20 transition-colors">
        <span className="text-[10px] leading-none font-bold">{icon}</span>
      </div>
    </button>
  );
}
