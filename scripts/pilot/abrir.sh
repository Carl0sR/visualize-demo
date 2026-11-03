#!/bin/sh
set -eu
repo=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
. "$repo/../pullboard-runtime/env.sh"
cd "$repo"
exec pullboard view --project
