"use client";

import { SubscriptionData } from "../../process/subscription/types";

interface StockFormProps {
  data: SubscriptionData;
  onUpdate: (data: Partial<SubscriptionData>) => void;
}

export function StockForm({ data, onUpdate }: StockFormProps) {
  const initialCategories = [
    { name: "Standard A4 Paper", unit: "Reams", key: "paper_a4" },
    { name: "Large Format Vinyl", unit: "Yards", key: "vinyl_lf" },
    { name: "Lamination Film", unit: "Rolls", key: "lam_film" },
    { name: "Flex Banner Material", unit: "Feet", key: "flex_banner" },
  ];

  const handleStockChange = (key: string, value: string) => {
    const currentStocks = data.stocks || [];
    const existingIndex = currentStocks.findIndex((s) => s.itemName === key);

    const newStocks = [...currentStocks];
    const numericValue = parseInt(value) || 0;

    if (existingIndex > -1) {
      newStocks[existingIndex].quantity = numericValue;
    } else {
      const cat = initialCategories.find((c) => c.key === key);
      newStocks.push({
        itemName: key,
        quantity: numericValue,
        unit: cat?.unit || "units",
      });
    }

    onUpdate({ stocks: newStocks });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-orange-400">Inventory Setup</h2>
        <p className="text-xs opacity-60">
          Initialize your stock levels to enable Auto-Shortage Prompting
          (Feature 7.2).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {initialCategories.map((item) => {
          // 🔥 Find existing value in the store for this specific item
          const currentValue = data.stocks?.find(
            (s) => s.itemName === item.key,
          )?.quantity;

          return (
            <div
              key={item.key}
              className="glass-card bg-white/5 p-4 flex flex-col gap-3 border border-white/5"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{item.name}</span>
                <span className="text-[10px] opacity-40 uppercase">
                  {item.unit}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  // 🔥 Controlled input: shows value from store or empty string
                  value={currentValue !== undefined ? currentValue : ""}
                  onChange={(e) => handleStockChange(item.key, e.target.value)}
                  className="w-full bg-blue-950/50 border border-white/10 rounded-xl h-12 px-4 text-cyan-400 font-mono outline-none focus:border-orange-500 transition-all"
                  placeholder={`0 ${item.unit}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] opacity-30">
                  Current Level
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
        <p className="text-[10px] text-orange-200 leading-tight">
          💡 <strong>Pro Tip:</strong> Setting accurate initial stock allows the{" "}
          <strong>Smart Payment Management</strong> to auto-calculate material
          waste (Feature 4.4).
        </p>
      </div>
    </div>
  );
}
