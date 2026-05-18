#!/usr/bin/env bash
# PostToolUse hook — runs make test-file when a test file is written or edited.
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

if [[ "$FILE" != *.test.ts && "$FILE" != *.test.tsx ]]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ "$FILE" == */app/* ]]; then
  RELATIVE_FILE="${FILE#$REPO_ROOT/app/}"
  echo "[hook] test → app: $RELATIVE_FILE"
  cd "$REPO_ROOT/app"
  make test-file files="$RELATIVE_FILE"
fi
