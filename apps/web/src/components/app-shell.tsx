"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button, Separator } from "@repo/ui";
import { blurFadeVariants, blurFadeTransition } from "@/lib/motion";

type AppShellProps = {
  backHref?: string;
  children: React.ReactNode;
  description: string;
  headerContent?: React.ReactNode;
  title: string;
};

export function AppShell({ backHref, children, description, headerContent, title }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen min-h-[100svh] min-h-[100dvh] w-full max-w-6xl flex-col gap-8 px-4 py-12 md:px-8">
      <motion.header
        className="flex flex-col gap-3"
        variants={blurFadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={blurFadeTransition}
      >
        {backHref ? (
          <Button asChild variant="ghost" size="sm" className="-ml-2.5 w-fit">
            <Link href={backHref}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        ) : (
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Energy & Policy Institute
          </span>
        )}
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.01em] text-primary">
          {title}
        </h1>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-secondary">
          {description}
        </p>
        {headerContent}
      </motion.header>
      <Separator className="bg-border-strong" />
      {children}
    </main>
  );
}
