import React from "react";
export function Badge({ variant = "secondary", className, ...rest }: any) {
  const v =
    variant === "destructive"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span
      {...rest}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${v} ${
        className ?? ""
      }`}
    />
  );
}
