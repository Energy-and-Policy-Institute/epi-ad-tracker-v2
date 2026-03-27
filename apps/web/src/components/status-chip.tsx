import { Badge } from "@repo/ui";

export function StatusChip({ active }: { active: boolean }) {
  return <Badge variant={active ? "success" : "danger"}>{active ? "Active" : "Inactive"}</Badge>;
}
