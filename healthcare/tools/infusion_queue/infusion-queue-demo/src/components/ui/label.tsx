import React from "react";
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={"block text-sm text-slate-600 mb-1 " + (props.className ?? "")}
    />
  );
}
