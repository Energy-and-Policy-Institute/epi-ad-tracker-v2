import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { FrontGroupDetail } from "@/components/frontgroup-detail";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { api, caller, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function FrontGroupPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const frontGroup = await caller.frontGroup.getStatic(id);

  if (!frontGroup) {
    notFound();
  }

  void api.frontGroup.get.prefetch({
    endDate: DEFAULT_END_DATE,
    frontGroupId: id,
    startDate: DEFAULT_START_DATE
  });
  void api.frontGroup.getTenMostExpensiveAds.prefetch({
    frontGroupId: id
  });

  return (
    <AppShell
      title={frontGroup.name}
      description="A parity-focused detail page for regional spend, exportable ads, and the highest-spend creative carousel."
    >
      <HydrateClient>
        <FrontGroupDetail frontGroupId={id} staticName={frontGroup.name} />
      </HydrateClient>
    </AppShell>
  );
}
