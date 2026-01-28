import React from "react";

export function Select({ value, onValueChange, children }: any) {
  return (
    <div data-select value={value} onChange={() => {}}>
      {children}
    </div>
  );
}
export function SelectTrigger({ className, children }: any) {
  return (
    <div className={`border rounded-md ${className ?? ""}`}>{children}</div>
  );
}
export function SelectValue({ placeholder }: any) {
  return <span>{placeholder}</span>;
}
export function SelectContent({ children }: any) {
  return <div className="p-2 bg-white border rounded-md">{children}</div>;
}
export function SelectItem({ value, children, onSelect }: any) {
  return (
    <div
      role="option"
      className="cursor-pointer px-2 py-1 rounded hover:bg-slate-100"
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  );
}

/* Convenience hook to mimic a simple select */
export function useSimpleSelect(value: any, onValueChange: (v: any) => void) {
  return {
    Select: ({ children }: any) => <div>{children}</div>,
    Trigger: ({ children }: any) => (
      <div className="border rounded-md px-3 py-2">{children}</div>
    ),
    Content: ({ children }: any) => (
      <div className="mt-1 border rounded-md bg-white p-1">{children}</div>
    ),
    Item: ({ value: v, children }: any) => (
      <div
        className="px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
        onClick={() => onValueChange(v)}
      >
        {children}
      </div>
    ),
  };
}
