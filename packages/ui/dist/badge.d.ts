import { type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
declare const badgeVariants: (props?: ({
    variant?: "default" | "danger" | "info" | "success" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
}
export declare function Badge({ className, variant, children, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=badge.d.ts.map