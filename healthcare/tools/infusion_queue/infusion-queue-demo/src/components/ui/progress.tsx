import React from "react";
export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className={`h-2 w-full rounded bg-slate-200 ${className ?? ""}`}>
      <div
        className="h-full rounded bg-blue-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
