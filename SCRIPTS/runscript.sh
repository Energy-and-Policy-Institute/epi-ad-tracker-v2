#!/bin/bash
set -euo pipefail

exec /home/ec2-user/epi-ad-tracker-v2/apps/meta-fetcher/scripts/run.sh "$@"
