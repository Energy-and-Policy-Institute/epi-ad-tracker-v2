"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Separator,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { convertToCsv, downloadCsv } from "@/lib/csv";
import {
  formatNumber,
  formatDate,
  formatDateSlash,
  formatInteger,
  formatPercent
} from "@/lib/format";
import {
  staggerContainer,
  fadeBlurItem,
  fadeBlurItemTransition,
  subtleFade,
  subtleFadeTransition,
  SNAP_EASE
} from "@/lib/motion";
import { useTRPC } from "@/trpc/client";
import { DataTableShell } from "./data-table";
import { DateInput } from "./date-input";
import { FilterBar } from "./filter-bar";
import { SpendChart } from "./spend-chart";
import { StatusChip } from "./status-chip";

type SortKey = "spend" | "state";

const ROWS_SHOWN_DEFAULT = 7;

export function FrontGroupMeta({
  frontGroupId,
  staticName
}: {
  frontGroupId: string;
  staticName: string;
}) {
  const trpc = useTRPC();
  const { data: frontGroup } = useSuspenseQuery(
    trpc.frontGroup.get.queryOptions({
      endDate: DEFAULT_END_DATE,
      frontGroupId,
      startDate: DEFAULT_START_DATE
    })
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <StatusChip active={frontGroup?.active ?? false} />
        <span className="text-sm text-secondary">
          {frontGroup?.lastAdDate
            ? `Last ad: ${formatDate(frontGroup.lastAdDate)}`
            : "No ads found for this front group."}
        </span>
        {frontGroup?.updatedAt ? (
          <span className="text-xs text-muted-foreground">
            · Updated {formatDateSlash(frontGroup.updatedAt)}
          </span>
        ) : null}
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-secondary">
        During this time frame, {frontGroup?.name ?? staticName} ran{" "}
        {formatNumber(frontGroup?.totalAds ?? 0)} ad(s) on Meta&apos;s platforms, spending at
        least ${formatNumber(frontGroup?.totalSpend ?? 0)}.
      </p>
    </>
  );
}

export function FrontGroupMetaFallback({ staticName }: { staticName: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-52" />
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-secondary">
        Loading the latest Meta ad activity for {staticName}.
      </p>
    </>
  );
}

export function FrontGroupDetail({
  frontGroupId,
  staticName
}: {
  frontGroupId: string;
  staticName: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<FrontGroupOverviewFallback />}>
        <FrontGroupOverview frontGroupId={frontGroupId} />
      </Suspense>
      <Suspense fallback={<FrontGroupTopAdsFallback staticName={staticName} />}>
        <FrontGroupTopAds frontGroupId={frontGroupId} staticName={staticName} />
      </Suspense>
    </div>
  );
}

function FrontGroupOverview({ frontGroupId }: { frontGroupId: string }) {
  const trpc = useTRPC();
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [sortBy, setSortBy] = useState<SortKey>("spend");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [rowsShown, setRowsShown] = useState(ROWS_SHOWN_DEFAULT);
  const deferredStartDate = useDeferredValue(startDate);
  const deferredEndDate = useDeferredValue(endDate);

  const { data: frontGroup } = useSuspenseQuery(
    trpc.frontGroup.get.queryOptions({
      endDate: deferredEndDate,
      frontGroupId,
      startDate: deferredStartDate
    })
  );

  const sortedRegions = useMemo(() => {
    const regions = [...(frontGroup?.regionalBreakdown ?? [])].filter(
      (region) => Math.floor(region.upperBound) > 0 && Math.floor(region.lowerBound) > 0
    );

    regions.sort((left, right) => {
      if (sortBy === "state") {
        return left.state.localeCompare(right.state);
      }

      return left.upperBound - right.upperBound;
    });

    return sortDirection === "asc" ? regions : regions.reverse();
  }, [frontGroup?.regionalBreakdown, sortBy, sortDirection]);

  const datesDiffer = startDate !== DEFAULT_START_DATE || endDate !== DEFAULT_END_DATE;

  const handleSort = (nextSortBy: SortKey) => {
    if (nextSortBy === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection("asc");
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <SpendChart ads={frontGroup?.exportableAds ?? []} />

      <FilterBar>
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end">
          <DateInput label="Start" value={startDate} onChange={setStartDate} />
          <DateInput label="End" value={endDate} onChange={setEndDate} />
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {datesDiffer ? (
              <motion.div
                variants={subtleFade}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={subtleFadeTransition}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(DEFAULT_START_DATE);
                    setEndDate(DEFAULT_END_DATE);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (!frontGroup) {
                return;
              }

              downloadCsv(
                convertToCsv(frontGroup.exportableAds, []),
                `${frontGroup.name}_${startDate}_to_${endDate}`
              );
            }}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </FilterBar>

      <DataTableShell>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead onClick={() => handleSort("state")} title="State" />
              <SortableHead onClick={() => handleSort("spend")} title="Spend" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRegions.slice(0, rowsShown).map((region) => (
              <TableRow key={region.state}>
                <TableCell className="text-primary">{region.state}</TableCell>
                <TableCell className="text-secondary">
                  ${formatInteger(region.lowerBound)} – ${formatInteger(region.upperBound)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(rowsShown < sortedRegions.length || rowsShown > ROWS_SHOWN_DEFAULT) ? (
          <div className="flex justify-center gap-2 border-t border-border px-4 py-3">
            {rowsShown < sortedRegions.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRowsShown(sortedRegions.length)}
              >
                Show {sortedRegions.length - rowsShown} more
              </Button>
            ) : null}
            {rowsShown > ROWS_SHOWN_DEFAULT ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRowsShown(ROWS_SHOWN_DEFAULT)}
              >
                Collapse
              </Button>
            ) : null}
          </div>
        ) : null}
      </DataTableShell>
    </motion.div>
  );
}

function FrontGroupTopAds({
  frontGroupId,
  staticName
}: {
  frontGroupId: string;
  staticName: string;
}) {
  const trpc = useTRPC();
  const [adShown, setAdShown] = useState(0);
  const { data: tenMost } = useSuspenseQuery(
    trpc.frontGroup.getTenMostExpensiveAds.queryOptions({
      frontGroupId
    })
  );
  const currentAd = tenMost[adShown];

  if (!currentAd) {
    return null;
  }

  return (
    <>
      <Separator />
      <motion.div
        className="flex flex-col gap-4"
        variants={fadeBlurItem}
        transition={fadeBlurItemTransition}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold text-primary">Top Ads by Spend</h3>
          <p className="text-sm text-secondary">
            The ten most expensive ads by {staticName}.
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative overflow-hidden rounded-lg border border-border bg-muted lg:min-h-[400px] lg:flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={adShown}
                initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
                transition={{ duration: 0.3, ease: SNAP_EASE }}
                className="h-full"
              >
                <Link
                  href={currentAd.ad_snapshot_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-full"
                >
                  <Image
                    alt="Ad screenshot"
                    className="h-full w-full object-contain"
                    height={700}
                    src={currentAd.ad_screenshot_url}
                    width={700}
                  />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex w-full max-w-xs flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium text-secondary">
                {adShown + 1} of {tenMost.length}
              </span>
              <span className="font-display text-3xl font-bold tracking-tight text-accent2">
                ${formatNumber(currentAd.spend_upper_bound)}
              </span>
              <p className="text-sm text-secondary">
                Most targeted: {currentAd.largestRegion.region} (
                {formatPercent(currentAd.largestRegion.percentage)})
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={adShown === 0}
                onClick={() => setAdShown((current) => current - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={adShown === tenMost.length - 1}
                onClick={() => setAdShown((current) => current + 1)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function SortableHead({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <TableHead>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-left transition-colors hover:text-primary"
        onClick={onClick}
      >
        {title}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

function FrontGroupOverviewFallback() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-80 w-full rounded-lg" />

      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <Skeleton className="h-10 w-full md:w-40" />
          <Skeleton className="h-10 w-full md:w-40" />
        </div>
      </div>

      <DataTableShell>
        <div className="space-y-3 p-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </DataTableShell>
    </div>
  );
}

function FrontGroupTopAdsFallback({ staticName }: { staticName: string }) {
  return (
    <>
      <Separator />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold text-primary">Top Ads by Spend</h3>
          <p className="text-sm text-secondary">
            Loading the highest-spend ads for {staticName}.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <Skeleton className="h-[26rem] flex-1 rounded-lg" />
          <div className="flex w-full max-w-xs flex-col gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
