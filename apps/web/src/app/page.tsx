import { AppShell } from "@/components/app-shell";
import { HomeDashboard } from "@/components/home-dashboard";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { api, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  void api.frontGroup.dynamicFrontGroups.prefetch({
    endDate: DEFAULT_END_DATE,
    startDate: DEFAULT_START_DATE
  });

  return (
    <AppShell
      title="Meta Ad Tracker"
      description="Browse all front groups, slice the Meta ad data by date, and export the view you are looking at without leaving the page."
    >
      <HydrateClient>
        <HomeDashboard />
      </HydrateClient>
    </AppShell>
  );
}
