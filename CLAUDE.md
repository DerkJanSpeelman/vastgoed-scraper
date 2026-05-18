# Project

Real estate listing scraper. Fetches, normalises, and stores property listings from Dutch real estate sources.

Monorepo. Current subdirectories: `app/`.

## Agents

For any work or discussion involving `app/`, use the context in `.claude/skills/app/architecture.md`.

When creating, moving, or renaming components or modules: update the relevant skill files in `.claude/skills/`.

**Component registry rule:**
- After creating, renaming, deleting, or meaningfully changing props of any component in `app/src/components/` → update `.claude/skills/app/architecture.md` (Components Registry section) immediately.
- Missing registry entries cause future agents to duplicate or misuse components.

## app

**Stack:** Next.js (App Router) · TypeScript · `postgres` (porsager) · PostgreSQL · Docker · `tsx` · yarn
**Port:** 3000
**Commands:** Always use `make` from `app/` — routes through Docker Compose.

## Setup & commands

Full setup steps and command reference: `./README.md` and `./Makefile`.

**Always use `docker`, `make`, or `yarn` commands** — never raw `node` scripts directly.

### Run modes

| Mode | Command | When to use |
|---|---|---|
| Docker (full stack) | `make up` (repo root) | Local development |
| Tear down | `make down` (repo root) | Stop everything |

### Services

| Service | Port | Container |
|---|---|---|
| Next.js app | 3000 | vastgoed-scraper-app-1 |
| PostgreSQL | 5432 (internal) | vastgoed-scraper-db-1 |

## Skills

| When | Read |
|---|---|
| Before any domain work | `.claude/skills/shared/ddd-cqrs.md` |
| Before writing any test | `.claude/skills/shared/testing.md` |
| Before writing any frontend markup | `.claude/skills/shared/web-components.md` |
| Before writing a migration | `.claude/skills/shared/migrations.md` |
| Before any terminal command | `.claude/skills/shared/run-modes.md` |
| Before any security-sensitive change | `.claude/skills/shared/security.md` |
| First time touching app/ | `.claude/skills/app/architecture.md` |

## Custom commands

| Command | Description |
|---|---|
| `/build <feature>` | Plan and build a feature end-to-end with phases, TDD, PR, and self-review |
