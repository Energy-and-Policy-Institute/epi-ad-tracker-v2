# Meta Fetcher

`apps/meta-fetcher` owns the Python data-pull flow that used to live under `SCRIPTS/`.

It preserves the current operational behavior:

- reads the same Meta and AWS env vars
- fetches the same Meta Ads Archive page IDs
- uploads screenshots to the same S3 bucket
- posts normalized ad batches to the same `/api/addads` endpoint by default
- remains compatible with the EC2 + SSM shell flow used by the legacy app

## Runtime

Recommended local/runtime toolchain:

- `uv` for environment management
- `python3` fallback for hosts that do not have `uv` installed yet

## Commands

With `uv`:

```bash
uv run --directory apps/meta-fetcher meta-fetcher fetch
```

Without `uv`:

```bash
PYTHONPATH=apps/meta-fetcher/src python3 -m meta_fetcher.cli fetch
```

## Environment

Required:

- `META_ACCESS_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Optional overrides:

- `META_FETCHER_API_URL`
- `META_FETCHER_S3_BUCKET`
- `META_FETCHER_DATE_MIN`
- `META_FETCHER_DATE_MAX`
- `META_FETCHER_BATCH_SIZE`

The EC2 compatibility runner lives at [apps/meta-fetcher/scripts/run.sh](/Users/dbrooks/.codex/worktrees/e280/epi-ad-tracker-v2/apps/meta-fetcher/scripts/run.sh).
