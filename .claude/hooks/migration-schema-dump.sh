#!/usr/bin/env bash
# PostToolUse hook — when a migration file is written/edited, remind Claude to
# update schema.dump.sql if it has not also been modified.
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

if [[ -z "$FILE" ]]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DUMP=""

if [[ "$FILE" =~ /app/db/migrations/[0-9]+_[^/]+\.ts$ ]]; then
  DUMP="app/db/schema.dump.sql"
else
  exit 0
fi

cd "$REPO_ROOT"

if git status --porcelain -- "$DUMP" 2>/dev/null | grep -q .; then
  exit 0
fi

cat >&2 <<EOF
[hook] migration-schema-dump: '$FILE' was modified but '$DUMP' has no pending changes.
Update '$DUMP' in the same change to reflect the migration's up(sql).
Edit the dump file directly — do NOT regenerate via shell.
Also ensure the migration is registered in app/db/migrations/index.ts.
EOF
exit 2
