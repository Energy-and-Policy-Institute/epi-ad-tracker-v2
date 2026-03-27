import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "./lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]", {
    defaultVariants: {
        variant: "default"
    },
    variants: {
        variant: {
            default: "bg-backgroundLight text-primary",
            danger: "bg-danger-soft text-danger",
            info: "bg-accent-soft text-accent",
            success: "bg-success-soft text-success"
        }
    }
});
export function Badge({ className, variant, ...props }) {
    return _jsx("div", { className: cn(badgeVariants({ className, variant })), ...props });
}
