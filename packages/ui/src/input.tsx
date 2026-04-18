import * as React from "react";
import { cn } from "./lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary shadow-none outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent",
        className
      )}
      type={type}
      {...props}
    />
  );
}
