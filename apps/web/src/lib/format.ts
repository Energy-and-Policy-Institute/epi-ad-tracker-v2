import { format, parseISO } from "date-fns";

// ── Numbers ──────────────────────────────────────────────

const intl = new Intl.NumberFormat("en-US");
const intlCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const intlCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const intlCurrencyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const intlPercent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** 1234567 → "1,234,567" */
export const formatNumber = (value: number) => intl.format(value);

/** 1234567 → "1.2M" */
export const formatCompact = (value: number) => intlCompact.format(value);

/** 1234567 → "$1,234,567" */
export const formatCurrency = (value: number) => intlCurrency.format(value);

/** 1234567 → "$1.2M" */
export const formatCurrencyCompact = (value: number) => intlCurrencyCompact.format(value);

/** 0.856 → "85.6%" */
export const formatPercent = (value: number) => intlPercent.format(value);

/** 1234.567 → "1,235" (rounds to integer with commas) */
export const formatInteger = (value: number) => intl.format(Math.round(value));

// ── Dates ────────────────────────────────────────────────

/** "2024-05-24" → "May 24, 2024" */
export const formatDate = (value: string | Date) =>
  format(typeof value === "string" ? parseISO(value) : value, "MMMM d, yyyy");

/** "2024-05-24" → "May 24" or "May 24, '24" when showYear is true */
export const formatDateShort = (value: string | Date, options?: { showYear?: boolean }) =>
  format(typeof value === "string" ? parseISO(value) : value, options?.showYear ? "MMM d, ''yy" : "MMM d");

/** "2024-05-24" → "5/24/2024" */
export const formatDateSlash = (value: string | Date) =>
  format(typeof value === "string" ? parseISO(value) : value, "M/dd/yyyy");

/** Date → "2024-05-24" (ISO date string for inputs) */
export const toISODate = (value: Date) => format(value, "yyyy-MM-dd");

// ── Backwards-compatible aliases ─────────────────────────

/** @deprecated Use formatNumber */
export const withCommas = formatNumber;

/** @deprecated Use formatCurrencyCompact */
export const toCompactCurrency = (value: number) =>
  formatCurrencyCompact(value).replace("$", "");
