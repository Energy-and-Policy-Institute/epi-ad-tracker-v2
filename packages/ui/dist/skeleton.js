import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Skeleton({ className, ...props }) {
    return _jsx("div", { className: cn("animate-pulse rounded-2xl bg-backgroundLight", className), ...props });
}
