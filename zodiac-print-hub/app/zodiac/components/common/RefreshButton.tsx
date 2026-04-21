"use client";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function RefreshButton({ onRefresh, isLoading }: RefreshButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRefresh();
      }}
      disabled={isLoading}
      className={`p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-90 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Sync Workspace"
    >
      <div className={isLoading ? "animate-spin" : ""}>
        <span className="text-xs block">🔄</span>
      </div>
    </button>
  );
}
