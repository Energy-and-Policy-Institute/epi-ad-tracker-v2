import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { AppShell } from "@/components/app-shell";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const ads = await caller.frontGroup.ads();

  return (
    <AppShell
      title="Ads Gallery"
      description="A simple fallback list of ads with screenshots, preserved while the broader App Router migration comes online."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((ad) => (
          <Link href={`/ad/${ad.id}`} key={ad.id}>
            <Card className="h-full border-none bg-white/95 shadow-sm transition-transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-lg">{ad.page_name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-muted">
                  <Image
                    alt="Ad screenshot"
                    className="h-60 w-full object-cover"
                    height={360}
                    src={ad.ad_screenshot_url}
                    width={640}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
