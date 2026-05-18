---
name: run-modes
description: >
  When and how to run the stack. Docker Compose is the default for all development.
  Commands always go through make.
---

# Run Modes

## Default: Docker Compose

**All development uses Docker Compose.** This means:
- All `make` commands run from `app/` or the repo root
- Tests, typecheck, migrations — always via `make` → Docker
- Package installation — `make install package=<name>` from `app/`

**If the stack is not running, start it. Do not ask — just do it.**

```bash
make up    # from repo root — starts all containers
make down  # from repo root — stops all containers
```

## Services

| Service | Container name | Port |
|---|---|---|
| Next.js app | `vastgoed-scraper-app-1` | `3000` |
| PostgreSQL | `vastgoed-scraper-db-1` | `5432` (internal) |

## Common make targets (from `app/`)

| Target | What it does |
|---|---|
| `make typecheck` | Run `tsc --noEmit` inside Docker |
| `make test` | Run all Jest tests inside Docker |
| `make test-file files="<path>"` | Run a specific test file |
| `make migrate` | Run pending migrations |
| `make migrate-rollback` | Roll back the last migration |
| `make install package=<name>` | Add a yarn dependency |
| `make dev` | Start Next.js dev server (handled by docker-compose up) |
| `make build` | Production build |

## Common make targets (from repo root)

| Target | What it does |
|---|---|
| `make up` | Start all containers in detached mode |
| `make down` | Stop all containers |
| `make logs` | Tail container logs |
| `make shell` | Open a shell in the app container |
