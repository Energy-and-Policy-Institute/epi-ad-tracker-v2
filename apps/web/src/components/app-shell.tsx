"use client";

import { motion } from "framer-motion";
import { Separator } from "@repo/ui";
import { blurFadeVariants, blurFadeTransition } from "@/lib/motion";

type AppShellProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

export function AppShell({ children, description, title }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-12 md:px-8">
      <motion.header
        className="flex flex-col gap-3"
        variants={blurFadeVariants}
        initial="initial"
        animate="animate"
        transition={blurFadeTransition}
      >
        <span className="text-xs font-medium uppercase tracking-widest text-secondary">
          Energy & Policy Institute
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          {title}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-secondary">
          {description}
        </p>
      </motion.header>
      <Separator />
      {children}
    </main>
  );
}
