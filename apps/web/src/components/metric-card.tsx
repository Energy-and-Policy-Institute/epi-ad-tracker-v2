"use client";

import { motion } from "framer-motion";
import { fadeBlurItem, fadeBlurItemTransition } from "@/lib/motion";

export function MetricCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <motion.div
      className="flex min-w-40 flex-1 flex-col gap-0.5 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 shadow-[var(--shadow-panel)]"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-secondary">
        {label}
      </span>
      <span className="font-display text-[1.6rem] font-semibold tracking-tight text-primary">
        {value}
      </span>
    </motion.div>
  );
}
