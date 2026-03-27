import * as React from "react";

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-white/90 p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      {children}
    </div>
  );
}
