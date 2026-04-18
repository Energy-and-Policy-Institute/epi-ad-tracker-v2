"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { fadeBlurItem, fadeBlurItemTransition } from "@/lib/motion";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

// ── Types ───────────────────────────────────────────────────

type ChartMode = "line" | "bar";

type Ad = {
  adDeliveryStartTime: string | null;
  spendUpperBound: number;
  deliveryByRegion: Array<{ percentage: number; region: string }>;
};

type LineDataPoint = {
  month: string;
  spend: number;
};

type StackedDataPoint = { month: string } & Record<string, string | number>;

// ── Constants ───────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const TOP_N_STATES = 5;

const STACK_COLORS = [
  "#185fa5", // editorial blue (primary accent)
  "#d85a30", // warm orange (accent2)
  "#1d9e75", // muted green
  "#3e7cb1", // softer blue
  "#b8702a", // amber-brown
  "#9c9b96", // warm neutral (Other)
];

// ── Helpers ─────────────────────────────────────────────────

function toMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[parseInt(month!) - 1]} '${year!.slice(2)}`;
}

function aggregateLineData(ads: Ad[]): LineDataPoint[] {
  const map = new Map<string, number>();

  for (const ad of ads) {
    if (!ad.adDeliveryStartTime) continue;
    const key = toMonthKey(ad.adDeliveryStartTime);
    map.set(key, (map.get(key) ?? 0) + ad.spendUpperBound);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, spend]) => ({ month: formatMonthKey(key), spend: Math.round(spend) }));
}

function aggregateStackedData(ads: Ad[]): { data: StackedDataPoint[]; states: string[] } {
  // month → state → spend
  const byMonthState = new Map<string, Map<string, number>>();
  // state → total spend (for ranking)
  const stateTotals = new Map<string, number>();

  for (const ad of ads) {
    if (!ad.adDeliveryStartTime) continue;
    const monthKey = toMonthKey(ad.adDeliveryStartTime);

    if (!byMonthState.has(monthKey)) {
      byMonthState.set(monthKey, new Map());
    }
    const stateMap = byMonthState.get(monthKey)!;

    for (const region of ad.deliveryByRegion) {
      const spend = ad.spendUpperBound * region.percentage;
      stateMap.set(region.region, (stateMap.get(region.region) ?? 0) + spend);
      stateTotals.set(region.region, (stateTotals.get(region.region) ?? 0) + spend);
    }
  }

  // Pick top N states by total spend
  const ranked = Array.from(stateTotals.entries())
    .sort(([, a], [, b]) => b - a);
  const topStates = ranked.slice(0, TOP_N_STATES).map(([s]) => s);
  const hasOther = ranked.length > TOP_N_STATES;
  const stateKeys = hasOther ? [...topStates, "Other"] : topStates;

  // Build chart data
  const data = Array.from(byMonthState.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, stateMap]) => {
      const point: StackedDataPoint = { month: formatMonthKey(monthKey) };
      let otherTotal = 0;

      for (const [state, spend] of stateMap) {
        if (topStates.includes(state)) {
          point[state] = Math.round(spend);
        } else {
          otherTotal += spend;
        }
      }

      if (hasOther) {
        point.Other = Math.round(otherTotal);
      }

      // Fill missing states with 0
      for (const s of stateKeys) {
        if (!(s in point)) point[s] = 0;
      }

      return point;
    });

  return { data, states: stateKeys };
}

// ── Spring hook ─────────────────────────────────────────────

function useSpringProgress(trigger: string | number) {
  const shouldReduceMotion = useReducedMotion();
  const spring = useSpring(0, { damping: 15, stiffness: 100, restDelta: 0.001 });
  const [value, setValue] = useState(shouldReduceMotion ? 1 : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(1);
      return;
    }
    spring.jump(0);
    spring.set(1);
  }, [spring, trigger, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    return spring.on("change", setValue);
  }, [spring, shouldReduceMotion]);

  return value;
}

// ── Chart ───────────────────────────────────────────────────

export function SpendChart({ ads }: { ads: Ad[] }) {
  const [mode, setMode] = useState<ChartMode>("line");
  const lineData = useMemo(() => aggregateLineData(ads), [ads]);
  const { data: stackedData, states } = useMemo(() => aggregateStackedData(ads), [ads]);
  const progress = useSpringProgress(mode);

  // Line: left-to-right reveal via clip-path
  const lineClip = `inset(0 ${(1 - progress) * 100}% 0 0)`;

  // Bar: spring-multiply all state values so bars grow upward
  const animatedBarData = useMemo(
    () =>
      stackedData.map((point) => {
        const animated: StackedDataPoint = { month: point.month };
        for (const state of states) {
          animated[state] = Math.round((point[state] as number) * progress);
        }
        return animated;
      }),
    [stackedData, states, progress],
  );

  const lineYMax = useMemo(() => {
    if (lineData.length === 0) return 100;
    return Math.ceil(Math.max(...lineData.map((d) => d.spend)) * 1.15);
  }, [lineData]);

  const barYMax = useMemo(() => {
    if (stackedData.length === 0) return 100;
    const maxTotal = Math.max(
      ...stackedData.map((point) =>
        states.reduce((sum, s) => sum + (point[s] as number), 0),
      ),
    );
    return Math.ceil(maxTotal * 1.15);
  }, [stackedData, states]);

  if (lineData.length < 2) return null;

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold text-primary">Spend Over Time</h3>
          <p className="text-sm text-secondary">Monthly ad spend distribution</p>
        </div>
        <div className="flex gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5">
          <ChartToggle active={mode === "line"} onClick={() => setMode("line")}>
            <TrendingUp className="h-3 w-3" />
            Line
          </ChartToggle>
          <ChartToggle active={mode === "bar"} onClick={() => setMode("bar")}>
            <BarChart3 className="h-3 w-3" />
            Bar
          </ChartToggle>
        </div>
      </div>

      <div className="h-80 w-full rounded-[var(--radius-card)] border border-border bg-surface p-4 pt-6 shadow-[var(--shadow-panel)]">
        {mode === "line" ? (
          <div className="h-full w-full" style={{ clipPath: lineClip }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-secondary)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v: number) => formatCurrencyCompact(v)}
                  tick={{ fontSize: 11, fill: "var(--color-secondary)" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  domain={[0, lineYMax]}
                />
                <Tooltip
                  content={<LineTooltip />}
                  cursor={{ stroke: "var(--color-border)", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="url(#spendGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--color-accent)",
                    stroke: "var(--color-surface)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={animatedBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--color-secondary)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v: number) => formatCurrencyCompact(v)}
                tick={{ fontSize: 11, fill: "var(--color-secondary)" }}
                tickLine={false}
                axisLine={false}
                width={52}
                domain={[0, barYMax]}
              />
              <Tooltip
                content={<StackedTooltip />}
                cursor={{ fill: "var(--color-muted)" }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-secondary">{value}</span>
                )}
              />
              {states.map((state, i) => (
                <Bar
                  key={state}
                  dataKey={state}
                  stackId="spend"
                  fill={STACK_COLORS[i % STACK_COLORS.length]}
                  radius={i === states.length - 1 ? [3, 3, 0, 0] : undefined}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

// ── Subcomponents ───────────────────────────────────────────

function ChartToggle({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-surface text-primary shadow-sm"
          : "text-secondary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function LineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <p className="text-xs text-secondary">{label}</p>
      <p className="text-sm font-semibold text-primary">
        {formatCurrency(payload[0]!.value)}
      </p>
    </div>
  );
}

function StackedTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  // Show items in reverse so the top bar segment is listed first
  const sorted = [...payload].reverse();

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <p className="mb-1.5 text-xs font-medium text-primary">{label}</p>
      <div className="flex flex-col gap-1">
        {sorted.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-secondary">{entry.dataKey}</span>
            </span>
            <span className="font-medium text-primary">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 border-t border-border pt-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary">Total</span>
          <span className="font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
