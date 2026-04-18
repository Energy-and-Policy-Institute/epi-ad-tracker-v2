"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Download, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Input,
  Skeleton,
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
import { formatCurrencyCompact, formatDateShort, formatNumber } from "@/lib/format";
import {
  staggerContainer,
  subtleFade,
  subtleFadeTransition
} from "@/lib/motion";
import { useTRPC } from "@/trpc/client";
import { DataTableShell } from "./data-table";
import { DateInput } from "./date-input";
import { FilterBar } from "./filter-bar";
import { MetricCard } from "./metric-card";
import { StatusChip } from "./status-chip";

type SortKey = "adSpend" | "name" | "numAds" | "rank" | "status";

export function HomeDashboard() {
  const trpc = useTRPC();
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [sortBy, setSortBy] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const deferredStartDate = useDeferredValue(startDate);
  const deferredEndDate = useDeferredValue(endDate);
  const deferredQuery = useDeferredValue(query);

  const { data: frontGroups } = useSuspenseQuery(
    trpc.frontGroup.dynamicFrontGroups.queryOptions({
      endDate: deferredEndDate,
      startDate: deferredStartDate
    })
  );

  const sortedFrontGroups = useMemo(() => {
    const nextItems = [...frontGroups];

    nextItems.sort((left, right) => {
      switch (sortBy) {
        case "status":
          return Number(left.active) - Number(right.active);
        case "name":
          return left.name.localeCompare(right.name);
        case "numAds":
          return left.numAds - right.numAds;
        case "adSpend":
          return left.adSpendUpper - right.adSpendUpper;
        case "rank":
        default:
          return left.rank - right.rank;
      }
    });

    const orderedItems = sortDirection === "asc" ? nextItems : nextItems.reverse();

    return orderedItems.filter((entry) =>
      entry.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery, frontGroups, sortBy, sortDirection]);

  const totalSpendUpper = frontGroups.reduce(
    (total, current) => total + current.adSpendUpper,
    0
  );
  const datesDiffer = startDate !== DEFAULT_START_DATE || endDate !== DEFAULT_END_DATE;
  const yearsDiffer = startDate.slice(0, 4) !== endDate.slice(0, 4);

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
      <motion.section
        className="flex flex-wrap gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <MetricCard label="Groups" value={String(sortedFrontGroups.length)} />
        <MetricCard label="Total Spend" value={formatCurrencyCompact(totalSpendUpper)} />
        <MetricCard label="Date Window" value={`${formatDateShort(startDate, { showYear: yearsDiffer })} — ${formatDateShort(endDate, { showYear: yearsDiffer })}`} />
      </motion.section>

      <FilterBar>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-xs font-medium text-secondary">
            Search
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Type a name..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>
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
            onClick={() =>
              downloadCsv(
                convertToCsv(frontGroups, ["regionalBreakdown", "id"]),
                `frontgroups_data_${startDate}_to_${endDate}`
              )
            }
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
              <SortableHead onClick={() => handleSort("rank")} title="Rank" />
              <SortableHead onClick={() => handleSort("status")} title="Status" />
              <SortableHead onClick={() => handleSort("name")} title="Name" />
              <SortableHead onClick={() => handleSort("numAds")} title="Ads" />
              <SortableHead onClick={() => handleSort("adSpend")} title="Spend" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFrontGroups.map((frontGroup) => {
              const topTen = frontGroup.rank <= 10;
              return (
                <TableRow key={frontGroup.id}>
                  <TableCell
                    className={
                      topTen
                        ? "w-16 text-center font-semibold tabular-nums text-accent2"
                        : "w-16 text-center tabular-nums text-tertiary"
                    }
                  >
                    {frontGroup.rank}
                  </TableCell>
                  <TableCell className="w-24">
                    <StatusChip active={frontGroup.active} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/frontgroup/${encodeURIComponent(frontGroup.id)}`}
                      className="font-medium text-primary transition-colors hover:text-accent"
                    >
                      {frontGroup.name}
                    </Link>
                  </TableCell>
                  <TableCell className="w-20 text-center tabular-nums text-secondary">
                    {frontGroup.numAds}
                  </TableCell>
                  <TableCell
                    className={
                      topTen
                        ? "tabular-nums font-semibold text-accent2"
                        : "tabular-nums text-secondary"
                    }
                  >
                    ${formatNumber(frontGroup.adSpendLower)} – ${formatNumber(frontGroup.adSpendUpper)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DataTableShell>
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

export function HomeDashboardFallback() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap gap-10">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex min-w-36 flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </section>

      <Separator />

      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full lg:w-40" />
          <Skeleton className="h-10 w-full lg:w-40" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
