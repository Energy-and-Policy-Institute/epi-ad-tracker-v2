import { Card } from "@repo/ui";
import * as React from "react";

type AppShellProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

export function AppShell({ children, description, title }: AppShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <Card className="overflow-hidden border-none bg-primary px-8 py-10 text-white shadow-[0_35px_80px_-40px_rgba(17,25,40,0.75)]">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
            Energy & Policy Institute
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            {description}
          </p>
        </div>
      </Card>
      {children}
    </main>
  );
}
