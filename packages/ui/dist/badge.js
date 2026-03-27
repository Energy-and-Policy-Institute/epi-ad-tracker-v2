import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "./lib/utils";
const badgeVariants = cva("inline-flex items-center gap-1.5 text-xs font-medium", {
    defaultVariants: {
        variant: "default"
    },
    variants: {
        variant: {
            default: "text-secondary",
            danger: "text-danger",
            info: "text-accent",
            success: "text-success"
        }
    }
});
export function Badge({ className, variant, children, ...props }) {
    const dotColor = variant === "success"
        ? "bg-success"
        : variant === "danger"
            ? "bg-danger"
            : variant === "info"
                ? "bg-accent"
                : "bg-secondary";
    return (_jsxs("span", { className: cn(badgeVariants({ className, variant })), ...props, children: [_jsx("span", { className: cn("inline-block h-1.5 w-1.5 rounded-full", dotColor) }), children] }));
}
