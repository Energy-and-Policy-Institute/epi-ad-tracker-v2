"use client";

import { motion } from "framer-motion";
import { fadeBlurItem, fadeBlurItemTransition } from "@/lib/motion";

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      variants={fadeBlurItem}
      transition={fadeBlurItemTransition}
    >
      {children}
    </motion.div>
  );
}
