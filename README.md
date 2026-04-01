# EPI Ad Tracker Monorepo

This repository now runs as a `pnpm` + Turborepo workspace with the legacy web app preserved alongside the new App Router app and the extracted Python data-pull service.

## Structure

- `apps/legacy-web`: the preserved Pages Router application and compatibility cron/API surface
- `apps/web`: the new Next.js 16 App Router application
- `apps/meta-fetcher`: the Python Meta Ads Archive puller and sync CLI
- `packages/api`: shared tRPC v11 routers, context, and server callers
- `packages/db`: shared Prisma schema/client helpers
- `packages/ui`: shared UI primitives
- `packages/tailwind-config`: shared Tailwind v4 theme layer
- `packages/eslint-config`, `packages/typescript-config`: shared workspace configuration

## Workspace Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

## App Commands

Legacy web:

```bash
pnpm --filter legacy-web dev
```

New web app:

```bash
pnpm --filter web dev
```

Meta fetcher:

```bash
PYTHONPATH=apps/meta-fetcher/src python3 -m meta_fetcher.cli fetch
```

If `uv` is available:

```bash
uv run --directory apps/meta-fetcher meta-fetcher fetch
```

## Notes

- `apps/web` is the primary new frontend surface.
- `apps/legacy-web` remains runnable for fallback and operational compatibility.
- `apps/meta-fetcher` preserves the current EC2 + SSM + S3 data-pull behavior while removing the Python logic from the old `SCRIPTS/` surface.
