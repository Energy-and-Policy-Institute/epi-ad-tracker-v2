import { Card } from "@repo/ui";
import type { ReactNode } from "react";

export function DataTableShell({ children }: { children: ReactNode }) {
  return <Card className="overflow-hidden border-none bg-white/95 shadow-sm">{children}</Card>;
}
