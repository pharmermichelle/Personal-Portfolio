import React from "react";

type TabsCtx = { value: string; set: (v: string) => void };
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, set] = React.useState(defaultValue);
  return <Ctx.Provider value={{ value, set }}>{children}</Ctx.Provider>;
}
export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex gap-2 rounded-md border bg-white p-1">
      {children}
    </div>
  );
}
export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.set(value)}
      className={`px-3 py-1 rounded ${
        active ? "bg-blue-600 text-white" : "bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}
export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
