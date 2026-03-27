import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "./lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
  {
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
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ className, variant }))} {...props} />;
}
