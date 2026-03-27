#!/usr/bin/env python3

from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "apps" / "meta-fetcher" / "src"))

from meta_fetcher.cli import main


if __name__ == "__main__":
    raise SystemExit(main(["fetch", *sys.argv[1:]]))
