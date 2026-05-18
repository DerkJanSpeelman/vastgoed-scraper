#!/usr/bin/env bash
# PostToolUse hook — runs make typecheck when a TypeScript file is edited.
# Receives tool call JSON on stdin.

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

INPUT=$(cat)

FILE=$(echo "$INPUT" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const i=JSON.parse(d);
    console.log(i.tool_input?.file_path || '');
  } catch { console.log(''); }
});
")

if [[ "$FILE" != *.ts && "$FILE" != *.tsx ]]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ "$FILE" == */app/* ]]; then
  echo "[hook] typecheck → app"
  cd "$REPO_ROOT/app"
  make typecheck || exit 1
fi
