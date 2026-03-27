"use client";

import { Input } from "@repo/ui";

type DateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateInput({ label, onChange, value }: DateInputProps) {
  return (
    <label className="flex min-w-40 flex-col gap-2 text-sm font-medium text-secondary">
      <span>{label}</span>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
