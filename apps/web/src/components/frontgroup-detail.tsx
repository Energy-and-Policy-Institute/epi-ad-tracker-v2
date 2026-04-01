"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpDown, ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { convertToCsv, downloadCsv } from "@/lib/csv";
import { formatNumber, formatDate, formatDateSlash, formatInteger, formatPercent } from "@/lib/format";
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
    <motion.div
      className="flex flex-col gap-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="flex items-center gap-3"
        variants={fadeBlurItem}
        transition={fadeBlurItemTransition}
      >
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </Button>
        <StatusChip active={frontGroup?.active ?? false} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-2"
        variants={fadeBlurItem}
        transition={fadeBlurItemTransition}
      >
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          {frontGroup?.name ?? staticName}
        </h2>
        <p className="text-sm text-secondary">
          {frontGroup?.lastAdDate
            ? `Last ad: ${formatDate(frontGroup.lastAdDate)}`
            : "No ads found for this front group."}
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          During this time frame, {frontGroup?.name ?? staticName} ran{" "}
          {formatNumber(frontGroup?.totalAds ?? 0)} ad(s) on Meta&apos;s platforms, spending at
          least ${formatNumber(frontGroup?.totalSpend ?? 0)}.
        </p>
        {frontGroup?.updatedAt ? (
          <p className="text-xs text-muted-foreground">
            Updated {formatDateSlash(frontGroup.updatedAt)}
          </p>
        ) : null}
      </motion.div>

      <Separator />

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

      {currentAd ? (
        <>
          <Separator />
          <motion.div
            className="flex flex-col gap-4"
            variants={fadeBlurItem}
            transition={fadeBlurItemTransition}
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-primary">Top Ads by Spend</h3>
              <p className="text-sm text-secondary">
                The ten most expensive ads by {frontGroup?.name ?? staticName}.
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
                  <span className="text-3xl font-semibold tracking-tight text-primary">
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
      ) : null}
    </motion.div>
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
