import React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={"rounded-xl border bg-white " + (props.className ?? "")}
    />
  );
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={"border-b px-4 py-3 " + (props.className ?? "")}
    />
  );
}
export function CardTitle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={"text-lg font-semibold " + (props.className ?? "")}
    />
  );
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={"px-4 py-3 " + (props.className ?? "")} />;
}
