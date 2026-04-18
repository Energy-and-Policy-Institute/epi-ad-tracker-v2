import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import {
  FrontGroupDetail,
  FrontGroupMeta,
  FrontGroupMetaFallback
} from "@/components/frontgroup-detail";
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
    <HydrateClient>
      <AppShell
        backHref="/"
        title={frontGroup.name}
        description="Regional spend breakdown and highest-spend ad carousel."
        headerContent={
          <Suspense fallback={<FrontGroupMetaFallback staticName={frontGroup.name} />}>
            <FrontGroupMeta frontGroupId={id} staticName={frontGroup.name} />
          </Suspense>
        }
      >
        <FrontGroupDetail frontGroupId={id} staticName={frontGroup.name} />
      </AppShell>
    </HydrateClient>
  );
}
