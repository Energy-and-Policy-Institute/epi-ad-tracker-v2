import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Input({ className, type, ...props }) {
    return (_jsx("input", { className: cn("flex h-9 w-full rounded-md border border-border bg-transparent px-3 text-sm text-primary shadow-none outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary", className), type: type, ...props }));
}
