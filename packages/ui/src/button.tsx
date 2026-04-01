import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
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
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost:
          "hover:bg-muted hover:text-primary",
        link:
          "text-accent underline-offset-4 hover:underline",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:text-primary",
        secondary:
          "bg-muted text-primary hover:bg-muted/80"
      }
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}
