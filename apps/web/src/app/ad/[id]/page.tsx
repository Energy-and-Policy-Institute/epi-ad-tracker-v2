import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@repo/ui";
import { AppShell } from "@/components/app-shell";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function AdPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      backHref="/ads"
      title="Ad Detail"
      description="Individual ad detail view."
    >
      <Suspense fallback={<AdDetailFallback />}>
        <AdDetail id={id} />
      </Suspense>
    </AppShell>
  );
}

async function AdDetail({ id }: { id: string }) {
  const ad = await caller.frontGroup.ad(id);

  if (!ad) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-primary">{ad.page_name}</h2>
        <p className="text-sm text-secondary">Screenshot and detail view for this advertisement.</p>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-muted shadow-[var(--shadow-panel)]">
        <Image
          alt="Ad screenshot"
          className="h-auto w-full object-contain"
          height={960}
          src={ad.ad_screenshot_url}
          width={960}
        />
      </div>
    </div>
  );
}

function AdDetailFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-[28rem] w-full rounded-lg" />
    </div>
  );
}
