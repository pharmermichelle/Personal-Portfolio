import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "md";
};
export function Button({
  variant = "default",
  size = "md",
  className,
  ...rest
}: Props) {
  const v =
    variant === "outline"
      ? "border bg-white"
      : variant === "secondary"
      ? "bg-slate-100"
      : variant === "destructive"
      ? "bg-red-600 text-white"
      : "bg-blue-600 text-white";
  const s = size === "sm" ? "px-2 py-1 text-sm" : "px-3 py-2";
  return (
    <button {...rest} className={`${v} rounded-md ${s} ${className ?? ""}`} />
  );
}
