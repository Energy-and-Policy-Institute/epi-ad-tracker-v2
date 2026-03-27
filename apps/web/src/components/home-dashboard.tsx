"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpDown, Download, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/ui";
import { DEFAULT_END_DATE, DEFAULT_START_DATE } from "@/lib/date-range";
import { convertToCsv, downloadCsv } from "@/lib/csv";
import { toCompactCurrency } from "@/lib/format";
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
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="All Groups" value={String(sortedFrontGroups.length)} />
        <MetricCard label="Total Spend" value={`$${toCompactCurrency(totalSpendUpper)}`} />
        <MetricCard label="Date Window" value={`${startDate} to ${endDate}`} />
      </section>

      <FilterBar>
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex min-w-64 flex-1 flex-col gap-2 text-sm font-medium text-secondary">
            <span>Search front groups</span>
            <Input
              placeholder="Type a utility or organization name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
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
            onClick={() =>
              downloadCsv(
                convertToCsv(frontGroups, ["regionalBreakdown", "id"]),
                `frontgroups_data_${startDate}_to_${endDate}`
              )
            }
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
              <SortableHead onClick={() => handleSort("rank")} title="Rank" />
              <SortableHead onClick={() => handleSort("status")} title="Status" />
              <SortableHead onClick={() => handleSort("name")} title="Name" />
              <SortableHead onClick={() => handleSort("numAds")} title="Ads" />
              <SortableHead onClick={() => handleSort("adSpend")} title="Money spent" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFrontGroups.map((frontGroup) => (
              <TableRow key={frontGroup.id}>
                <TableCell className="text-center text-secondary">{frontGroup.rank}</TableCell>
                <TableCell>
                  <StatusChip active={frontGroup.active} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/frontgroup/${encodeURIComponent(frontGroup.id)}`}
                    className="font-medium text-accent transition-colors hover:text-accent/80 hover:underline"
                  >
                    {frontGroup.name}
                  </Link>
                </TableCell>
                <TableCell className="text-center text-secondary">{frontGroup.numAds}</TableCell>
                <TableCell className="text-secondary">
                  ${frontGroup.adSpendLower} - ${frontGroup.adSpendUpper}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableShell>
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
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}
