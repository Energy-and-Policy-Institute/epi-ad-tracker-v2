import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "./lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide",
  {
    defaultVariants: {
      variant: "default"
    },
    variants: {
      variant: {
        default: "bg-muted text-secondary",
        danger: "bg-danger-soft text-danger",
        info: "bg-accent-soft text-accent",
        success: "bg-success-soft text-success"
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
