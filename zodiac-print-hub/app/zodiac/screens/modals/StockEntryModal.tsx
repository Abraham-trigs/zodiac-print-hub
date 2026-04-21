// "use client";

// import { useState } from "react";
// import { useProcessStore } from "../store/process.store";
// import { usePriceStore } from "../store/price.store";

// export function StockEntryModal({ itemKey, itemName, unit }) {
//   const [quantity, setQuantity] = useState(0);
//   const [unitCost, setUnitCost] = useState(0);

//   const handleStockIn = () => {
//     // 1. Update Inventory Level
//     useProcessStore.getState().updateData("SUBSCRIPTION", {
//       stocks: [{ itemName: itemKey, quantity, unit }],
//     });

//     // 2. TRIGGER FEATURE 19: Price Update Prompter
//     // If new cost is >5% higher than previous, the prompter modal opens.
//     triggerPriceUpdateLogic(itemKey, unitCost);
//   };

//   return (
//     <div className="glass-card p-6 w-full max-w-sm border-cyan-500/20">
//       <h2 className="text-xl font-bold text-white mb-1">Restock Item</h2>
//       <p className="text-[10px] opacity-50 uppercase tracking-widest mb-6">
//         {itemName}
//       </p>

//       <div className="flex flex-col gap-4 mb-6">
//         <div className="flex flex-col gap-1">
//           <label className="text-[10px] font-bold opacity-40 uppercase">
//             Quantity ({unit})
//           </label>
//           <input
//             type="number"
//             className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400"
//             onChange={(e) => setQuantity(Number(e.target.value))}
//           />
//         </div>

//         <div className="flex flex-col gap-1">
//           <label className="text-[10px] font-bold opacity-40 uppercase">
//             Unit Cost (₵)
//           </label>
//           <input
//             type="number"
//             className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-orange-400 font-mono"
//             placeholder="0.00"
//             onChange={(e) => setUnitCost(Number(e.target.value))}
//           />
//         </div>
//       </div>

//       <button
//         onClick={handleStockIn}
//         className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl uppercase tracking-widest text-xs active:scale-95"
//       >
//         Confirm Entry
//       </button>
//     </div>
//   );
// }
