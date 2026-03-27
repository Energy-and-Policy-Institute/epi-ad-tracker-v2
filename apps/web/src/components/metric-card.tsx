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
      className="flex flex-col gap-1"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      <span className="text-2xl font-semibold tracking-tight text-primary">{value}</span>
      <span className="text-xs font-medium text-secondary">{label}</span>
    </motion.div>
  );
}
