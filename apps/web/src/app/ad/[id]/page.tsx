import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { AppShell } from "@/components/app-shell";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function AdPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ad = await caller.frontGroup.ad(id);

  if (!ad) {
    notFound();
  }

  return (
    <AppShell
      title={ad.page_name}
      description="A single ad detail view powered directly from the shared tRPC caller for server-side reads."
    >
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost">
          <Link href="/ads">Back to ads</Link>
        </Button>
        <Card className="border-none bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle>{ad.page_name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-muted">
              <Image
                alt="Ad screenshot"
                className="h-auto w-full object-contain"
                height={960}
                src={ad.ad_screenshot_url}
                width={960}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
