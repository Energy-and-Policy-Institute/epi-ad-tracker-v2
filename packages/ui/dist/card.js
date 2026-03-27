import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Card({ className, ...props }) {
    return (_jsx("div", { className: cn("rounded-[var(--radius-card)] border border-border/80 bg-white/95 shadow-[var(--shadow-panel)]", className), ...props }));
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn("flex flex-col gap-2 p-6", className), ...props });
}
export function CardTitle({ className, ...props }) {
    return _jsx("h3", { className: cn("text-lg font-semibold tracking-tight text-primary", className), ...props });
}
export function CardDescription({ className, ...props }) {
    return _jsx("p", { className: cn("text-sm leading-relaxed text-secondary", className), ...props });
}
export function CardContent({ className, ...props }) {
    return _jsx("div", { className: cn("p-6 pt-0", className), ...props });
}
