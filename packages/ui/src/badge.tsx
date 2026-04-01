import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "./lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 text-xs font-medium",
  {
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
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  const dotColor =
    variant === "success"
      ? "bg-success"
      : variant === "danger"
        ? "bg-danger"
        : variant === "info"
          ? "bg-accent"
          : "bg-secondary";

  return (
    <span className={cn(badgeVariants({ className, variant }))} {...props}>
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColor)} />
      {children}
    </span>
  );
}
