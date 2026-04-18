"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeBlurItem, fadeBlurItemTransition } from "@/lib/motion";

export function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-panel)]"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      {children}
    </motion.div>
  );
}
