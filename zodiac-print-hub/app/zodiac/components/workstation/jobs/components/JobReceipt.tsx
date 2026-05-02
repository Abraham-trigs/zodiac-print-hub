"use client";

import { Printer, ShieldCheck, QrCode } from "lucide-react";
import { format } from "date-fns";

export function JobReceipt({ job, payments }: { job: any; payments: any[] }) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white text-black p-8 md:p-12 max-w-2xl mx-auto font-mono text-[11px] leading-relaxed print:p-0">
      {/* --- WATERMARK --- */}
      <div className="border-4 border-black p-1 mb-8">
        <div className="border border-black p-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              ZODIAC NODE
            </h1>
            <p className="font-bold opacity-60">
              Industrial Print OS • Transaction Record
            </p>
          </div>
          <div className="text-right">
            <span className="bg-black text-white px-3 py-1 font-black text-lg">
              {job.shortRef}
            </span>
          </div>
        </div>
      </div>

      {/* --- META DATA --- */}
      <div className="grid grid-cols-2 gap-10 mb-10 pb-10 border-b border-dashed border-black/20">
        <div>
          <h4 className="font-black uppercase mb-2">Customer Identity</h4>
          <p className="text-sm font-bold">{job.client?.name}</p>
          <p>{job.client?.phone}</p>
        </div>
        <div className="text-right">
          <h4 className="font-black uppercase mb-2">Timestamp</h4>
          <p>{format(new Date(), "MMMM do, yyyy")}</p>
          <p>{format(new Date(), "HH:mm:ss")} GMT</p>
        </div>
      </div>

      {/* --- JOB SPECS --- */}
      <table className="w-full mb-10">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 uppercase">Service / Description</th>
            <th className="text-right py-2 uppercase">Specs</th>
            <th className="text-right py-2 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          <tr>
            <td className="py-4">
              <p className="font-black uppercase text-sm">{job.serviceName}</p>
              <p className="opacity-60 italic">Standard Production Queue</p>
            </td>
            <td className="py-4 text-right">
              {job.width}x{job.height}
              {job.unit} <br />
              Qty: {job.quantity}
            </td>
            <td className="py-4 text-right font-bold">
              ₵{job.totalPrice.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* --- FINANCIAL LEDGER --- */}
      <div className="bg-zinc-100 p-6 rounded-lg mb-10">
        <h4 className="font-black uppercase mb-4 text-[9px] opacity-40">
          Payment Verification
        </h4>
        {payments.map((p, i) => (
          <div key={i} className="flex justify-between items-center mb-2">
            <span>
              {p.method} ({p.reference?.slice(-8)})
            </span>
            <span className="font-bold">₵{p.amount.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-black/10 mt-4 pt-4 flex justify-between items-center text-lg font-black">
          <span className="uppercase">Total Received</span>
          <span>₵{totalPaid.toFixed(2)}</span>
        </div>
      </div>

      {/* --- FOOTER: THE HANDSHAKE --- */}
      <div className="flex flex-col items-center text-center gap-4 py-10 border-t-2 border-black">
        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[9px]">
          <ShieldCheck size={14} />
          AUTHENTICATED BY ZODIAC CORE
        </div>
        <p className="max-w-xs opacity-50">
          This receipt is a legal record of payment and production
          authorization. Present the ShortRef above for collection.
        </p>
        <div className="mt-4 opacity-20">
          <QrCode size={40} />
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="fixed bottom-10 right-10 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl print:hidden hover:scale-110 transition-all"
      >
        <Printer size={24} />
      </button>
    </div>
  );
}
