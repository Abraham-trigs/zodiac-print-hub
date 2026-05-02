"use client";

import { Printer, MapPin, Phone, Banknote, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export function DailyDispatchManifest({
  riderName,
  deliveries,
}: {
  riderName: string;
  deliveries: any[];
}) {
  const dateStr = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div className="bg-white text-black p-10 max-w-4xl mx-auto font-mono text-[11px] leading-tight print:p-0 print:m-0">
      {/* --- MANIFEST HEADER --- */}
      <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            ZODIAC DISPATCH
          </h1>
          <p className="font-bold opacity-60 uppercase tracking-widest text-[9px]">
            Industrial Logistics Node • Daily Manifest
          </p>
        </div>
        <div className="text-right">
          <p className="font-black uppercase">Rider: {riderName}</p>
          <p className="opacity-60">{dateStr}</p>
        </div>
      </div>

      {/* --- MISSION TABLE --- */}
      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="bg-zinc-100 border-y-2 border-black">
            <th className="p-3 text-left uppercase border-r border-black/10">
              Order Ref
            </th>
            <th className="p-3 text-left uppercase border-r border-black/10">
              Destination & Contact
            </th>
            <th className="p-3 text-right uppercase border-r border-black/10">
              To Collect
            </th>
            <th className="p-3 text-center uppercase">Proof of Delivery</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {deliveries.map((d, i) => {
            const balance =
              d.job.totalPrice -
              (d.job.payments?.reduce((s: any, p: any) => s + p.amount, 0) ||
                0);
            return (
              <tr key={i} className="align-top">
                {/* ID & Type */}
                <td className="p-4 border-r border-black/5">
                  <div className="bg-black text-white px-2 py-1 inline-block font-black text-sm mb-2">
                    {d.job.shortRef}
                  </div>
                  <p className="text-[8px] font-bold uppercase opacity-40">
                    {d.type}
                  </p>
                </td>

                {/* Logistics */}
                <td className="p-4 border-r border-black/5 max-w-[250px]">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <p className="font-bold">{d.address || "Shop Pickup"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Phone size={10} />
                    <p>
                      {d.client?.name} • {d.client?.phone}
                    </p>
                  </div>
                </td>

                {/* Financials */}
                <td className="p-4 border-r border-black/5 text-right font-black text-sm">
                  {balance > 0 ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-red-500 flex items-center gap-1">
                        <Banknote size={10} /> COLLECT
                      </span>
                      ₵{balance.toFixed(2)}
                    </div>
                  ) : (
                    <span className="text-emerald-600 text-[9px] uppercase tracking-widest">
                      Prepaid
                    </span>
                  )}
                </td>

                {/* Manual POD Spot */}
                <td className="p-4 relative">
                  <div className="w-full h-16 border border-dashed border-black/20 rounded flex items-center justify-center">
                    <span className="text-[8px] opacity-10 uppercase font-black tracking-[0.3em]">
                      Customer Signature
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* --- SUMMARY --- */}
      <div className="grid grid-cols-3 gap-6 mb-12 border-t-2 border-black pt-8">
        <div className="text-center">
          <p className="text-[8px] font-black opacity-40 uppercase mb-1">
            Stops Total
          </p>
          <p className="text-xl font-black">{deliveries.length}</p>
        </div>
        <div className="text-center border-x border-black/10">
          <p className="text-[8px] font-black opacity-40 uppercase mb-1">
            Est. Cash Collection
          </p>
          <p className="text-xl font-black">
            ₵
            {deliveries
              .reduce((sum, d) => {
                const b =
                  d.job.totalPrice -
                  (d.job.payments?.reduce(
                    (s: any, p: any) => s + p.amount,
                    0,
                  ) || 0);
                return sum + (b > 0 ? b : 0);
              }, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black opacity-40 uppercase mb-1">
            Warehouse Clear
          </p>
          <ShieldCheck size={24} className="mx-auto mt-1 opacity-20" />
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 border-t border-black/5 pt-6 text-center opacity-40 italic">
        Authorized by Zodiac Production Node • v2.0 Industrial OS
      </footer>

      {/* --- FLOATING PRINT BUTTON --- */}
      <button
        onClick={() => window.print()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-3xl print:hidden hover:scale-110 active:scale-95 transition-all"
      >
        <Printer size={28} />
      </button>
    </div>
  );
}
