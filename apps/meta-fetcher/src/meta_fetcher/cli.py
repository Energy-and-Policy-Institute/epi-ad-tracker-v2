from __future__ import annotations

import argparse
from typing import Sequence

from .fetcher import (
    DEFAULT_BATCH_SIZE,
    DEFAULT_DATE_MAX,
    DEFAULT_DATE_MIN,
    DEFAULT_PAGE_IDS,
    DEFAULT_POST_URL,
    DEFAULT_SCREENSHOT_BUCKET,
    build_settings,
    run_fetch,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="meta-fetcher",
        description="Fetch Meta Ads Archive data and sync it into the tracker API.",
    )
    subcommands = parser.add_subparsers(dest="command")

    fetch_parser = subcommands.add_parser(
        "fetch",
        help="Pull the current configured set of page IDs and post them to the tracker API.",
    )
    fetch_parser.add_argument(
        "--page-id",
        action="append",
        dest="page_ids",
        help="Limit the run to one or more page IDs. May be passed multiple times.",
    )
    fetch_parser.add_argument(
        "--api-url",
        default=DEFAULT_POST_URL,
        help="Target /api/addads endpoint. Defaults to the current production endpoint.",
    )
    fetch_parser.add_argument(
        "--bucket",
        default=DEFAULT_SCREENSHOT_BUCKET,
        help="S3 bucket for top-ad screenshots.",
    )
    fetch_parser.add_argument(
        "--date-min",
        default=DEFAULT_DATE_MIN,
        help="Minimum ad delivery date for the Meta archive query.",
    )
    fetch_parser.add_argument(
        "--date-max",
        default=DEFAULT_DATE_MAX,
        help="Maximum ad delivery date for the Meta archive query.",
    )
    fetch_parser.add_argument(
        "--batch-size",
        default=DEFAULT_BATCH_SIZE,
        type=int,
        help="Number of records to POST to the API in each batch.",
    )

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    command = args.command or "fetch"
    if command != "fetch":
        parser.error(f"Unknown command: {command}")

    settings = build_settings(
        api_url=args.api_url,
        batch_size=args.batch_size,
        date_max=args.date_max,
        date_min=args.date_min,
        screenshot_bucket=args.bucket,
    )
    page_ids = args.page_ids or DEFAULT_PAGE_IDS

    run_fetch(settings, page_ids=page_ids)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
