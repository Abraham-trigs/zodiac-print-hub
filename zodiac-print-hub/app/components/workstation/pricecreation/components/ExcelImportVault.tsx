"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Trash2,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useModalStore } from "@store/useModalStore";
import { useDataStore } from "@store/core/useDataStore";
import { apiClient } from "@lib/client/api/client";

interface ExcelRow {
  name: string; // Technical Resource Name
  displayName?: string; // Customer-facing Name
  type: "MATERIAL" | "SERVICE";
  salePrice: number; // Retail Rate
  category: string; // Mapping to MaterialCategory or ServiceCategory
  calcType: string; // DIMENSIONAL, LINEAR, FLAT, AREA_BASED
  unit?: string; // sqft, ft, piece, etc.
  purchasePrice?: number; // Cost for Materials
  basePrice?: number; // Internal rate for Services
  initialStock?: number; // Opening Balance
  lowStockThreshold?: number;
}

/**
 * EXCEL_IMPORT_VAULT
 * The Industrial Engine for bulk recipe ingestion.
 * Placed in the DETAIL layer of the PriceCreationWorkstation.
 */
export function ExcelImportVault() {
  const { closeModal } = useModalStore();
  const { initData, currentOrgId } = useDataStore();

  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================================================
     PARSER: Excel to JSON
  ========================================================= */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<ExcelRow>(ws);

        // Data Normalization (Cleaning whitespace and casing)
        const cleanData = data.map((row) => ({
          ...row,
          type: String(row.type || "MATERIAL").toUpperCase() as any,
          calcType: String(row.calcType || "FLAT").toUpperCase(),
          name: String(row.name).trim(),
          category: String(row.category || "General").trim(),
        }));

        setRows(cleanData);
      } catch (err) {
        setError(
          "Parse Error: Ensure your spreadsheet matches the required template.",
        );
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  /* =========================================================
     COMMIT: API Shipment
  ========================================================= */
  const handleCommit = async () => {
    if (rows.length === 0) return;
    setIsCommitting(true);
    setError(null);

    try {
      await apiClient("/api/prices/bulk", {
        method: "POST",
        body: rows,
      });

      // 🔥 CRITICAL: Refresh the Global Store
      // Ensures the new PriceList and StockItems appear across the app
      await initData(currentOrgId);

      closeModal("DETAIL");
    } catch (err: any) {
      setError(
        err.message ||
          "Engine Error: Bulk commit failed. Check data integrity.",
      );
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-8 animate-in slide-in-from-bottom duration-500 relative">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zodiac-orange/10 flex items-center justify-center border border-zodiac-orange/20">
            <FileSpreadsheet className="text-zodiac-orange" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              Data Vault
            </h2>
            <p className="text-[8px] text-zodiac-orange uppercase font-black tracking-[0.4em] mt-1">
              Industrial Bulk Ingestion
            </p>
          </div>
        </div>
        <button
          onClick={() => closeModal("DETAIL")}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
        >
          <X size={20} className="opacity-40" />
        </button>
      </div>

      {/* 2. DROPZONE / PREVIEW AREA */}
      <div className="flex-1 flex flex-col min-h-0">
        {rows.length === 0 ? (
          <label className="flex-1 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] hover:bg-white/[0.05] hover:border-zodiac-orange/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group">
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              {isParsing ? (
                <Loader2
                  className="animate-spin text-zodiac-orange"
                  size={32}
                />
              ) : (
                <UploadCloud
                  size={32}
                  className="opacity-20 group-hover:opacity-100 text-zodiac-orange transition-all"
                />
              )}
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest block">
                Upload Spreadsheet
              </span>
              <span className="text-[7px] opacity-30 uppercase font-black mt-1 block">
                Accepted: .XLSX, .XLS
              </span>
            </div>
          </label>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            {/* DATA TABLE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                  <tr className="text-[7px] uppercase font-black tracking-widest text-white/40 border-b border-white/5">
                    <th className="p-5">Resource Identity</th>
                    <th className="p-5">Financials</th>
                    <th className="p-5">Logic</th>
                    <th className="p-5 text-right">
                      <button
                        onClick={() => setRows([])}
                        className="text-red-500/50 hover:text-red-500 transition-colors uppercase text-[7px] font-black"
                      >
                        Clear All
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-tight">
                            {row.name}
                          </span>
                          <span
                            className={`text-[7px] font-black uppercase tracking-tighter ${row.type === "MATERIAL" ? "text-emerald-400" : "text-blue-400"}`}
                          >
                            {row.type} • {row.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-black text-cyan-400">
                            ₵{row.salePrice}
                          </span>
                          <span className="text-[7px] opacity-30 uppercase font-black">
                            Markup: {row.purchasePrice || row.basePrice || 0}{" "}
                            Cost
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[8px] font-black uppercase bg-white/5 px-2 py-1 rounded border border-white/5 text-white/60">
                          {row.calcType} {row.unit && `(${row.unit})`}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() =>
                            setRows((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. ERROR HUD */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-[8px] font-black uppercase text-red-500">
            {error}
          </p>
        </div>
      )}

      {/* 4. FOOTER ACTION */}
      <div className="mt-8 flex flex-col items-center">
        {rows.length > 0 && (
          <button
            onClick={handleCommit}
            disabled={isCommitting}
            className="w-full max-w-md py-5 bg-zodiac-orange rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-zodiac-orange/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {isCommitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Processing Junctions...</span>
              </>
            ) : (
              <>
                <Database size={18} />
                <span>Pudh {rows.length} Recipes to Hub</span>
              </>
            )}
          </button>
        )}
        <p className="mt-6 text-[7px] text-white/10 uppercase font-black tracking-[0.3em]">
          Secured Data Pipeline • Smart Deduplication Active
        </p>
      </div>
    </div>
  );
}
