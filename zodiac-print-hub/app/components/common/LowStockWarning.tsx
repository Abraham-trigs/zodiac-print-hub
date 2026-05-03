"use client";

import { useDataStore } from "@store/core/useDataStore";
import { selectActiveStockAlerts } from "@store/selectors/data.selectors";
import { AlertCircle, Zap } from "lucide-react";

export function LowStockWarning() {
  const alerts = useDataStore(selectActiveStockAlerts);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 group hover:bg-red-500/20 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
          <AlertCircle className="text-white" size={24} />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
            Inventory Breach
          </span>
          <p className="text-xs font-bold text-white/80">
            {alerts.length} Materials below threshold
          </p>
        </div>

        <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-2">
          <Zap size={14} className="text-orange-400" />
          <span className="text-[10px] font-black text-orange-400 uppercase">
            Action Required
          </span>
        </div>
      </div>
    </div>
  );
}
