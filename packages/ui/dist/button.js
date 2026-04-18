import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./lib/utils";
const buttonVariants = cva("inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", {
    defaultVariants: {
        size: "md",
        variant: "default"
    },
    variants: {
        size: {
            icon: "h-8 w-8",
            lg: "h-10 rounded-md px-4 text-sm",
            md: "h-9 rounded-md px-3",
            sm: "h-8 rounded-md px-2.5 text-xs"
        },
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            ghost: "hover:bg-accent-soft hover:text-accent",
            link: "text-accent underline-offset-4 hover:underline",
            outline: "border border-border-strong bg-surface hover:border-accent hover:bg-accent-soft hover:text-accent",
            secondary: "bg-muted text-primary hover:bg-border"
        }
    }
});
export function Button({ asChild = false, className, size, variant, ...props }) {
    const Comp = asChild ? Slot : "button";
    return _jsx(Comp, { className: cn(buttonVariants({ className, size, variant })), ...props });
}
