import { type VariantProps } from "class-variance-authority";
import * as React from "react";
declare const buttonVariants: (props?: ({
    size?: "md" | "icon" | "sm" | null | undefined;
    variant?: "default" | "ghost" | "outline" | "secondary" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
export declare function Button({ asChild, className, size, variant, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=button.d.ts.map