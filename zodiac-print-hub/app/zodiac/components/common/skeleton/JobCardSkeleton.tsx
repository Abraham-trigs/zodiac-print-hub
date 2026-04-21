"use client";

// ✅ Correct import: Pointing to the generic base component
import { Skeleton } from "./Skeleton";

export function JobCardSkeleton() {
  return (
    <div className="glass-card p-4 flex items-center justify-between border border-white/5 opacity-60">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Using the generic skeleton for the title area */}
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-3 w-24 rounded opacity-50" />
      </div>
      <div className="flex flex-col items-end gap-2">
        {/* Using the generic skeleton for the price and status */}
        <Skeleton className="h-4 w-16 rounded bg-orange-500/10" />
        <Skeleton className="h-2 w-10 rounded opacity-30" />
      </div>
    </div>
  );
}
