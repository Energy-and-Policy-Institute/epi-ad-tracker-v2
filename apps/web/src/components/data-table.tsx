"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeBlurItem, fadeBlurItemTransition } from "@/lib/motion";

export function DataTableShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="overflow-hidden rounded-lg border border-border"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      {children}
    </motion.div>
  );
}
