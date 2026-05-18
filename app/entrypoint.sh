#!/bin/sh
set -e

if [ ! -f yarn.lock ]; then
  echo "[entrypoint] No yarn.lock found, running yarn install..."
  yarn install
fi

exec "$@"
