import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Input({ className, type, ...props }) {
    return (_jsx("input", { className: cn("flex h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary shadow-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary/70 focus-visible:border-accent", className), type: type, ...props }));
}
