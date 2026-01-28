import React from "react";
type Props = {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
};
export function Switch({ id, checked, onCheckedChange }: Props) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}
