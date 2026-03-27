import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@repo/ui";
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
      description="Individual ad detail view."
    >
      <div className="flex flex-col gap-6">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/ads">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to ads
          </Link>
        </Button>
        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            alt="Ad screenshot"
            className="h-auto w-full object-contain"
            height={960}
            src={ad.ad_screenshot_url}
            width={960}
          />
        </div>
      </div>
    </AppShell>
  );
}
