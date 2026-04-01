import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Separator({ className, orientation = "horizontal", ...props }) {
    return (_jsx("div", { className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className), role: "separator", ...props }));
}
