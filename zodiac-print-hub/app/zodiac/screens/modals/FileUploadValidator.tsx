"use client";

import { useState } from "react";

export function FileUploadValidator() {
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Trigger the Validation Shot
    const result = JobFileSchema.safeParse({ file: selectedFile });

    if (!result.success) {
      setError(result.error.issues[0].message);
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile);
      // Proceed to Version Control Logic
    }
  };

  return (
    <div className="glass-card p-6 border-dashed border-2 border-white/10 hover:border-cyan-400/50 transition-all group">
      <label className="flex flex-col items-center justify-center cursor-pointer gap-4 py-8">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-transform ${file ? "bg-cyan-500 scale-110" : "bg-white/5 group-hover:scale-110"}`}
        >
          {file ? "✅" : "📤"}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">
            {file ? file.name : "Drop Print-Ready File"}
          </p>
          <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">
            PDF • TIFF • SVG (Max 200MB)
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept=".pdf,.tiff,.svg"
        />
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-lg">⚠️</span>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter leading-tight">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
