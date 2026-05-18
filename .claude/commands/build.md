# /build

Plan and build a feature end-to-end: from raw idea → refined PRD with phases → per-phase plan → implementation → review → next phase.

## Usage

```
/build <feature description>
/build --dont-ask <feature description>
```

### Flags

| Flag | Description |
|------|-------------|
| `--dont-ask` | Non-interactive mode. Skip all clarifying questions. Infer scope and acceptance criteria from the feature description and codebase. Never ask — always decide. |

---

## Skills reference

Load skills **lazily** — only when you are about to touch a relevant file. Do not read all skills upfront.

| When | Read |
|------|------|
| Always, before planning | `.claude/skills/shared/ddd-cqrs.md` |
| Always, before building | `.claude/skills/shared/testing.md` · `.claude/skills/shared/run-modes.md` · `.claude/skills/shared/security.md` |
| First time touching `app/` | `.claude/skills/app/architecture.md` |
| Before writing any frontend markup | `.claude/skills/shared/web-components.md` |
| Writing a migration | `.claude/skills/shared/migrations.md` |

---

## Overview

`/build` runs in two stages:

1. **Setup** (once): clarify the feature and produce a multi-phase PRD.
2. **Phase loop** (repeats until all phases are done): plan → build → verify → PR → review → fix → next phase.

Each phase produces exactly one PR. Each phase's PR branches from the previous phase's PR branch (or `main` for Phase 1). Never merge — PRs are left open for human review.

> **CRITICAL — autonomous execution**: Once started, `/build` runs the full phase loop without stopping. Do NOT pause to report progress between steps or between phases. Do NOT wait for user confirmation. The only output is the final summary when all phases are complete.

---

## Stage 1 — Setup (run once)

### Step 1 — Clarify

If `--dont-ask` was supplied, **skip this step entirely**: infer scope and acceptance criteria directly from the feature description and codebase — never ask a question.

Otherwise, ask the minimum questions needed to understand scope and acceptance criteria. Max 3 questions.

### Step 2 — Specify (PRD with phases)

Produce a PRD file structured into explicit phases. Each phase has its own scope and acceptance criteria:

- **What**: one-sentence feature statement
- **Why**: motivation / user value
- **Phases**: numbered list; each phase has its own acceptance criteria. Note any dependencies between phases.
- **Out of scope**: explicit exclusions

Persist the PRD to `.claude/PRPs/prds/`. It is the source of truth for all subsequent phases.

---

## Stage 2 — Phase loop

Repeat Steps 3–9 for every phase in the PRD, in order.

### Step 3 — Plan the next phase

Read the PRD. Identify the first phase that has no plan and is not marked complete.

Scan the codebase and extract all relevant patterns, conventions, and context before producing a plan file in `.claude/PRPs/plans/`.

### Step 4 — Build

**TDD is required for logic-bearing code.** For each handler, VO, entity, command/query, and UI component:

- Write the test first (RED)
- Write the implementation (GREEN)
- Run `make test-file files="<test file path>"` to confirm passing

**For plumbing** (mappers, container wiring, route registration): implementation-first is acceptable when the logic is trivial.

### Step 5 — Verify

After all steps in the plan are done:

- `make typecheck` — zero errors
- `make test-file files="<all new/changed test files>"` — all pass
- If changes cross module boundaries: `make test` — no regressions
- Security checklist (`.claude/skills/shared/security.md`) — always
- Update relevant skill files (architecture, components registry) — defer to this step

### Step 6 — PR

**Branch naming:** `<type>/<kebab-title>-phase-<N>`

**Base branch:**
- Phase 1: branch from `main`
- Phase 2+: branch from the **previous phase's PR branch**

**Commit title format:** `[TYPE]: <description>`

Steps:
- Create the branch, commit, and push
- Open the PR with `gh pr create --base <previous-phase-branch-or-main>`
- Record the PR number

### Step 7 — Self-review

a. Review the PR for CRITICAL/HIGH/MEDIUM/LOW issues.
b. Post findings to the PR using `gh pr review <PR number> --body "<findings>"`:
   - `--request-changes` if any CRITICAL or HIGH issues
   - `--comment` if only MEDIUM/LOW

### Step 8 — Fix & resolve

Fix **CRITICAL and HIGH** issues:
- Commit and push to the same branch
- Re-run `make typecheck` and affected tests

**MEDIUM and LOW**: post as a follow-up `gh pr comment`. Do not block the phase.

### Step 9 — Phase complete

Mark the phase as complete in the PRD file.

Report: phase number, PR URL, what was built, what was skipped, any open decisions.

**Never merge. The PR is left open for human review.**

---

If more phases remain, return to **Step 3**.

When all phases are complete, output a final summary: all phases, all PR URLs, any cross-phase open decisions.

---

## Rules

- Follow DDD/CQRS rules — `ddd-cqrs.md` is the canonical reference
- Follow error hierarchy from `ddd-cqrs.md` — never free-text error strings in handler code
- Every handler, VO, entity, mapper, and component gets a co-located test
- Check the component registry before writing any markup; add new components to the registry immediately
- All `make` commands run from `app/` via Docker Compose
- Never skip the DONE gate
- Each phase has exactly one PR; never combine multiple phases into one PR
