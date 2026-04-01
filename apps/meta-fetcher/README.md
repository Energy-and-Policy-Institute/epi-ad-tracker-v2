# Meta Fetcher

This is the dedicated Vercel app that replaces the old EC2 + SSM cron flow.

It runs a Python cron job on Vercel, pulls Meta Ads Archive data, normalizes it, and posts batches into the main app's `/api/addads` endpoint.

## Deploy

1. Create a new Vercel project with the root directory set to `apps/meta-fetcher`.
2. Add the environment variables from `.env.example`.
3. Deploy the project. Vercel will run the cron defined in `vercel.json`.

## Notes

- The cron stays at `2 7 * * 1` to match the old weekly fetch window.
- Screenshot generation is intentionally not part of the cron job anymore. The main app now generates screenshots lazily when an ad is viewed, which keeps the cron fast and removes the need for a browser inside the Python worker.
