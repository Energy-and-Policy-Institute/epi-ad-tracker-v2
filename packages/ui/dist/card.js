import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Card({ className, ...props }) {
    return (_jsx("div", { className: cn("rounded-lg border border-border bg-surface", className), ...props }));
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn("flex flex-col gap-1.5 p-6", className), ...props });
}
export function CardTitle({ className, ...props }) {
    return _jsx("h3", { className: cn("text-base font-semibold tracking-tight text-primary", className), ...props });
}
export function CardDescription({ className, ...props }) {
    return _jsx("p", { className: cn("text-sm text-secondary", className), ...props });
}
export function CardContent({ className, ...props }) {
    return _jsx("div", { className: cn("p-6 pt-0", className), ...props });
}
