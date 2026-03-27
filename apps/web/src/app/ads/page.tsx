import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const ads = await caller.frontGroup.ads();

  return (
    <AppShell
      title="Ads Gallery"
      description="Browse all tracked advertisements with screenshots."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((ad) => (
          <Link href={`/ad/${ad.id}`} key={ad.id}>
            <div className="group flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
              <div className="overflow-hidden rounded-md bg-muted">
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
    </AppShell>
  );
}
