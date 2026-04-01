#!/bin/bash
set -euo pipefail

REPO_ROOT="/home/ec2-user/epi-ad-tracker-v2"
LOG_PATH="$REPO_ROOT/log1.txt"

source /home/ec2-user/.bash_profile
source /home/ec2-user/.bashrc

export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/home/ec2-user/.local/bin:$PATH"

cd "$REPO_ROOT"
git pull

if command -v uv >/dev/null 2>&1; then
  uv run --directory "$REPO_ROOT/apps/meta-fetcher" meta-fetcher fetch > "$LOG_PATH" 2>&1
else
  export PYTHONPATH="$REPO_ROOT/apps/meta-fetcher/src:${PYTHONPATH:-}"
  python3 -m meta_fetcher.cli fetch > "$LOG_PATH" 2>&1
fi
