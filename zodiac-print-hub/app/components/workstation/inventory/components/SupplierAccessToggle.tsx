"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck, Mail, Loader2 } from "lucide-react";
import { apiClient } from "@lib/client/api/client";

export function SupplierAccessToggle({ supplier }: { supplier: any }) {
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      await apiClient(`/api/procurement/suppliers/${supplier.id}/onboard`, {
        method: "POST",
        body: {
          email: supplier.email,
          name: supplier.name,
        },
      });
      alert("Supplier Portal account created.");
    } finally {
      setIsInviting(false);
    }
  };

  if (supplier.linkedUserId) {
    return (
      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black uppercase text-emerald-500">
            Portal Access Active
          </span>
        </div>
        <span className="text-[8px] opacity-40 font-mono">
          UID: {supplier.linkedUserId.slice(-6)}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center">
      <UserPlus className="mx-auto mb-3 opacity-20" size={24} />
      <h4 className="text-[11px] font-black uppercase mb-1">
        Invite to Partner Portal
      </h4>
      <p className="text-[9px] opacity-40 uppercase mb-4">
        Allow this provider to view their own purchase orders
      </p>

      <button
        onClick={handleInvite}
        disabled={isInviting || !supplier.email}
        className="w-full py-3 bg-white text-black font-black uppercase text-[9px] rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all disabled:opacity-50"
      >
        {isInviting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Mail size={14} />
        )}
        Send Portal Invitation
      </button>
    </div>
  );
}
