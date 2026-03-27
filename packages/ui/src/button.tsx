import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    defaultVariants: {
      size: "md",
      variant: "default"
    },
    variants: {
      size: {
        icon: "h-10 w-10",
        md: "h-11 px-5",
        sm: "h-9 px-4"
      },
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        ghost: "bg-transparent text-secondary hover:bg-backgroundLight",
        outline:
          "border border-border bg-white text-primary shadow-sm hover:border-secondary/40 hover:bg-backgroundLight/50",
        secondary: "bg-accent text-white hover:bg-accent/90"
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
