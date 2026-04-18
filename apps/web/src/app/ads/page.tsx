import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@repo/ui";
import { AppShell } from "@/components/app-shell";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function AdsPage() {
  return (
    <AppShell
      title="Ads Gallery"
      description="Browse all tracked advertisements with screenshots."
    >
      <Suspense fallback={<AdsGalleryFallback />}>
        <AdsGallery />
      </Suspense>
    </AppShell>
  );
}

async function AdsGallery() {
  const ads = await caller.frontGroup.ads();

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {ads.map((ad) => (
        <Link href={`/ad/${ad.id}`} key={ad.id}>
          <div className="group flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-[var(--shadow-panel)] transition-colors hover:border-accent hover:bg-accent-soft">
            <div className="overflow-hidden rounded-md bg-surface-muted">
              <Image
                alt="Ad screenshot"
                className="h-52 w-full object-cover transition-transform group-hover:scale-[1.02]"
                height={360}
                src={ad.ad_screenshot_url}
                width={640}
              />
            </div>
            <span className="text-sm font-medium text-primary">{ad.page_name}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}

function AdsGalleryFallback() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-border p-3"
        >
          <Skeleton className="h-52 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </section>
  );
}
