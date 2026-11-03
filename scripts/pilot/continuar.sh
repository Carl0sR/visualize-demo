#!/bin/sh
set -eu
repo=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
. "$repo/../pullboard-runtime/env.sh"
cd "$repo"
case "${1:-status}" in
 status) exec pullboard status ;;
 docs|qa) exec "$repo/../pullboard-runtime/bin/run-lane" "$1" ;;
 *) echo "Uso: continuar.sh [status|docs|qa]" >&2; exit 2 ;;
esac
