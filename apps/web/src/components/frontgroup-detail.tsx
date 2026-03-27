"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronDown, ChevronUp, Download, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { convertToCsv, downloadCsv } from "@/lib/csv";
import { withCommas } from "@/lib/format";
import { useTRPC } from "@/trpc/client";
import { DataTableShell } from "./data-table";
import { DateInput } from "./date-input";
import { FilterBar } from "./filter-bar";
import { StatusChip } from "./status-chip";

type SortKey = "spend" | "state";

const ROWS_SHOWN_DEFAULT = 7;

export function FrontGroupDetail({
  frontGroupId,
  staticName
}: {
  frontGroupId: string;
  staticName: string;
}) {
  const trpc = useTRPC();
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [sortBy, setSortBy] = useState<SortKey>("spend");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [rowsShown, setRowsShown] = useState(ROWS_SHOWN_DEFAULT);
  const [adShown, setAdShown] = useState(0);
  const deferredStartDate = useDeferredValue(startDate);
  const deferredEndDate = useDeferredValue(endDate);

  const { data: frontGroup } = useSuspenseQuery(
    trpc.frontGroup.get.queryOptions({
      endDate: deferredEndDate,
      frontGroupId,
      startDate: deferredStartDate
    })
  );
  const { data: tenMost } = useSuspenseQuery(
    trpc.frontGroup.getTenMostExpensiveAds.queryOptions({
      frontGroupId
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
  const currentAd = tenMost[adShown];

  const handleSort = (nextSortBy: SortKey) => {
    if (nextSortBy === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection("asc");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/">Back to overview</Link>
        </Button>
        <StatusChip active={frontGroup?.active ?? false} />
      </div>

      <Card className="border-none bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl">{frontGroup?.name ?? staticName}</CardTitle>
          <CardDescription>
            {frontGroup?.lastAdDate
              ? `Last ad: ${dayjs(frontGroup.lastAdDate).format("MMMM DD, YYYY")}`
              : "No ads found for this front group."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="max-w-3xl text-sm leading-7 text-secondary">
            During this time frame, {frontGroup?.name ?? staticName} ran{" "}
            {withCommas(frontGroup?.totalAds ?? 0)} <strong>ad(s)</strong> on Meta&apos;s
            platforms, spending at least ${withCommas(frontGroup?.totalSpend ?? 0)}.
          </p>
          {frontGroup?.updatedAt ? (
            <p className="text-xs italic text-secondary">
              Last updated: {dayjs(frontGroup.updatedAt).format("M/DD/YYYY")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <FilterBar>
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-end">
          <DateInput label="Start date" value={startDate} onChange={setStartDate} />
          <DateInput label="End date" value={endDate} onChange={setEndDate} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {datesDiffer ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStartDate(DEFAULT_START_DATE);
                setEndDate(DEFAULT_END_DATE);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset dates
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
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
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </FilterBar>

      <DataTableShell>
        <Table>
          <TableHeader>
            <TableRow className="bg-backgroundLight/70">
              <SortableHead onClick={() => handleSort("state")} title="State" />
              <SortableHead onClick={() => handleSort("spend")} title="Money Spent" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRegions.slice(0, rowsShown).map((region) => (
              <TableRow key={region.state}>
                <TableCell className="text-secondary">{region.state}</TableCell>
                <TableCell className="text-secondary">
                  ${region.lowerBound.toFixed(0)} - ${region.upperBound.toFixed(0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap justify-center gap-3 px-6 py-4">
          {rowsShown < sortedRegions.length ? (
            <Button type="button" variant="ghost" onClick={() => setRowsShown(sortedRegions.length)}>
              Show {sortedRegions.length - rowsShown} more
            </Button>
          ) : null}
          {rowsShown > ROWS_SHOWN_DEFAULT ? (
            <Button type="button" variant="ghost" onClick={() => setRowsShown(ROWS_SHOWN_DEFAULT)}>
              Show less
            </Button>
          ) : null}
        </div>
      </DataTableShell>

      {currentAd ? (
        <Card className="border-none bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Most expensive ad carousel</CardTitle>
            <CardDescription>
              Click through the top ten most expensive ads by {frontGroup?.name ?? staticName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-muted lg:min-h-[420px] lg:flex-1">
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
              </div>
              <div className="flex w-full max-w-sm flex-col justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Ad {adShown + 1} of {tenMost.length}
                  </p>
                  <p className="text-3xl font-semibold text-primary">
                    ${currentAd.spend_upper_bound}
                  </p>
                  <p className="text-sm leading-7 text-secondary">
                    Most targeted state: {currentAd.largestRegion.region} (
                    {(currentAd.largestRegion.percentage * 100).toFixed(1)}%)
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={adShown === 0}
                    onClick={() => setAdShown((current) => current - 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={adShown === tenMost.length - 1}
                    onClick={() => setAdShown((current) => current + 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SortableHead({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <TableHead>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-left"
        onClick={onClick}
      >
        {title}
      </button>
    </TableHead>
  );
}
