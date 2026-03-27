import { Card, CardContent } from "@repo/ui";

export function MetricCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="border-none bg-white/95 shadow-sm">
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          {label}
        </span>
        <span className="text-2xl font-semibold text-primary">{value}</span>
      </CardContent>
    </Card>
  );
}
