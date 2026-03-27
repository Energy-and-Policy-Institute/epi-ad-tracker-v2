import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "./lib/utils";
export function Table({ className, ...props }) {
    return (_jsx("div", { className: "w-full overflow-x-auto", children: _jsx("table", { className: cn("w-full caption-bottom text-sm", className), ...props }) }));
}
export function TableHeader({ className, ...props }) {
    return _jsx("thead", { className: cn("[&_tr]:border-b [&_tr]:border-border", className), ...props });
}
export function TableBody({ className, ...props }) {
    return _jsx("tbody", { className: cn("[&_tr:last-child]:border-0", className), ...props });
}
export function TableRow({ className, ...props }) {
    return (_jsx("tr", { className: cn("border-b border-border transition-colors hover:bg-muted/50", className), ...props }));
}
export function TableHead({ className, ...props }) {
    return (_jsx("th", { className: cn("h-10 px-3 text-left align-middle text-xs font-medium text-secondary", className), ...props }));
}
export function TableCell({ className, ...props }) {
    return _jsx("td", { className: cn("px-3 py-3 align-middle text-primary", className), ...props });
}
