---
name: ddd-cqrs
description: >
  Canonical DDD/CQRS rules for all services. Entity, value object, command,
  query, handler, mapper, repository, container, database boundaries, SQL
  typing, and error handling. Read before writing any domain code.
---

# DDD / CQRS Rules

## Entity

- Private constructor. Static factories — implement only those the domain needs:
  - `static create()` — when the domain creates new instances (write path uses the entity factory)
  - `static existing()` — when the domain hydrates from DB (read path, write-side mapper)
- All properties are `readonly`.
- Every domain field has a value object — no raw primitive properties.
- No mutating methods — return a new instance instead.

```typescript
export class Page {
  private constructor(
    readonly id: number,
    readonly slug: PageSlug,
    readonly title: PageTitle,
  ) {}

  static create(slug: PageSlug, title: PageTitle): Page {
    return new Page(0, slug, title);
  }

  static existing(id: number, slug: PageSlug, title: PageTitle): Page {
    return new Page(id, slug, title);
  }
}
```

---

## Value Object

- Validates in constructor. Throws `ValidationError` on invalid input.
- Exposes a single `readonly value` property. No other logic.
- All VOs are synchronous. Uniqueness checks (e.g. "domain already taken") belong in the handler, not the VO.

```typescript
import { ValidationError } from '@/lib/errors';

export class PageSlug {
  readonly value: string;

  constructor(raw: string) {
    if (!raw.startsWith('/')) throw new ValidationError('PageSlug must start with /');
    this.value = raw;
  }
}
```

---

## Command DTO vs Command

Two distinct types — do not conflate.

- **`<action>.dto.ts`** — raw HTTP input payload only. No metadata.
- **`<action>.command.ts`** — what the handler consumes. Spreads DTO fields and adds cross-cutting metadata (`requesterId`, `correlationId`, etc.). Starts identical to the DTO but diverges as auth is added.

```typescript
// create-project.dto.ts — raw HTTP body
export interface CreateProjectDto {
  name: string;
  domain: string;
  adminEmail: string;
}

// create-project.command.ts — handler input
export class CreateProjectCommand {
  constructor(
    readonly name: string,
    readonly domain: string,
    readonly adminEmail: string,
    // readonly requesterId: number,  ← added when auth lands
  ) {}
}
```

---

## Command Handler

- Receives the **write repository interface** via constructor injection.
- Returns whatever the use case requires — an ID, a discriminated union, or void. **Never a DTO.**
- The controller or server action decides what to respond. It queries separately if it needs a full projection.
- Never executes SQL directly.
- Throws domain-specific errors for business rule violations (see Error Handling).
- **Always wraps `execute` in try/catch.** Re-throw `AppError` subclasses as-is; wrap anything else in a generic error and log it. The caller (controller or server action) catches at the `AppError` level.

```typescript
export class CreatePageHandler {
  constructor(private readonly repo: PageWriteRepository) {}

  async execute(command: CreatePageCommand): Promise<number> {
    try {
      const slug = new PageSlug(command.slug);
      const title = new PageTitle(command.title);
      const page = Page.create(slug, title);
      return await this.repo.save(page);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error('[CreatePageHandler] Unexpected error', e);
      throw new AppError('An unexpected error occurred', 500);
    }
  }
}
```

### Transaction Boundaries

When a single handler must perform **multiple writes that must succeed or fail together**, wrap them in a transaction. Using the `postgres` (porsager) driver:

```typescript
export class VerifyAdminUserHandler {
  constructor(
    private readonly userRepo: AdminUserWriteRepository,
    private readonly tokenRepo: VerificationTokenWriteRepository,
  ) {}

  async execute(command: VerifyAdminUserCommand): Promise<void> {
    try {
      await sql.begin(async (tx) => {
        await this.userRepo.activate(command.adminUserId, tx);
        await this.tokenRepo.markUsed(command.tokenId, tx);
      });
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error('[VerifyAdminUserHandler] Unexpected error', e);
      throw new AppError('An unexpected error occurred', 500);
    }
  }
}
```

**Rules:**
- Any pair of writes that must be atomic (mark entity + invalidate token, debit + credit, create + associate) **must** use a transaction.
- Never rely on application-level ordering as a substitute for atomicity. If the second write fails, the first must roll back.
- The handler orchestrates the transaction; repository impls receive the transaction connection (`tx/* sql */`) instead of the module-level `sql`.

---

## Query Structure

Each query owns five co-located files in `application/queries/<action>/`:

| File | Purpose |
|---|---|
| `<action>.query.ts` | Plain class — query input parameters |
| `<action>.row.ts` | Raw DB row type (snake_case, exact columns selected) |
| `<action>.dto.ts` | camelCase response shape returned to the caller |
| `<action>.mapper.ts` | Pure function: `to<Action>Dto(row) → dto`. All camelCase conversion here. |
| `<action>.handler.ts` | Injects read repo, calls mapper, returns `Dto[]` or `Dto \| null` |

**Query DTOs are never shared across queries.** Each query owns its own DTO.

**Query handlers return `T | null`** — not-found is a valid read result. The controller or server component decides what to do with `null` (404, empty state, `notFound()`).

```typescript
// get-projects.row.ts
export interface GetProjectsRow {
  id: number;
  name: string;
  domain: string;
  status: string;
  created_at: Date;
}

// get-projects.dto.ts
export interface GetProjectsDto {
  id: number;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
}

// get-projects.mapper.ts
export function toGetProjectsDto(row: GetProjectsRow): GetProjectsDto {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

// get-projects.handler.ts
export class GetProjectsHandler {
  constructor(private readonly repo: ProjectReadRepository) {}

  async execute(): Promise<GetProjectsDto[]> {
    const rows = await this.repo.findAll();
    return rows.map(toGetProjectsDto);
  }
}
```

---

## Event Handler Error Handling

Event handlers run **outside the request/response cycle** — there is no outer try/catch to catch their errors. They must handle errors explicitly. **Never use a single catch-all that swallows all errors.**

Distinguish two phases:

- **Write phase** — DB writes, token creation, state changes. Must not fail silently. Let errors propagate (or rethrow after logging) — a failed write usually means the system is in an inconsistent state.
- **Notification phase** — email, webhooks, analytics. Best-effort. Catch and log errors here, but do not let them mask the write phase.

```typescript
// WRONG — single catch swallows write failures silently
async function adminUserCreatedHandler(event: AdminUserCreatedEvent) {
  try {
    await tokenRepo.create(event.adminUserId);
    await sendEmail({ to: event.email, ... });
  } catch (e) {
    console.error(e); // write failure is invisible to the caller
  }
}

// CORRECT — write and notification phases separated
async function adminUserCreatedHandler(event: AdminUserCreatedEvent) {
  // Phase 1: write — must not fail silently; let the error propagate
  await tokenRepo.create(event.adminUserId);

  // Phase 2: notification — best-effort
  try {
    await sendEmail({ to: event.email, ... });
  } catch (e) {
    console.error('[adminUserCreated] Failed to send verification email', {
      adminUserId: event.adminUserId,
      error: e,
    });
    // email failure does not undo the token that was already created
  }
}
```

---

## Repository Interfaces

### Write repository — `domain/repositories/<name>.repository.interface.ts`

Typed to domain entities. Used by command handlers.

```typescript
export interface PageWriteRepository {
  save(page: Page): Promise<number>;
  update(page: Page): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### Read repository — `application/queries/<domain>.read-repository.ts`

Each method typed to the query-specific row type it serves. No DTO mapping here.

```typescript
import { GetProjectsRow } from './get-projects/get-projects.row';
import { GetProjectRow } from './get-project/get-project.row';

export interface ProjectReadRepository {
  findAll(): Promise<GetProjectsRow[]>;
  findById(id: number): Promise<GetProjectRow | null>;
}
```

---

## Mapper

### Write-side — `infrastructure/persistence/<domain>.mapper.ts`

Pure functions. Keeps the write repository impl focused on SQL only.

- `toDomain(row: DomainTableRow): Entity` — hydrates an entity via `Entity.existing()`
- `toPersistence(entity: Entity): Partial<DomainTableRow>` — extracts raw values for INSERT/UPDATE

```typescript
export function toDomain(row: ProjectTableRow): Project {
  return Project.existing(
    row.id,
    new ProjectName(row.name),
    new ProjectDomain(row.domain),
    new ProjectStatus(row.status),
  );
}

export function toPersistence(project: Project): Omit<ProjectTableRow, 'id' | 'created_at'> {
  return {
    name: project.name.value,
    domain: project.domain.value,
    status: project.status.value,
  };
}
```

The write-side row type lives in `infrastructure/persistence/<domain>.table.ts` — a full DB row used for write operations. This is distinct from the read-side `<action>.row.ts` types, which represent the exact columns selected for a specific query.

### Read-side — `application/queries/<action>/<action>.mapper.ts`

Pure `to<Action>Dto` function. Co-located with the query. All camelCase conversion lives here — never in the repository impl.

---

## Container

Plain object. Instantiate repositories → inject into handlers → export. Callers import the container only — never individual repositories or handlers.

```typescript
const pageReadRepository = new PageReadRepositoryImpl();
const pageWriteRepository = new PageWriteRepositoryImpl();

export const pagesContainer = {
  getAllPagesHandler: new GetAllPagesHandler(pageReadRepository),
  getPageBySlugHandler: new GetPageBySlugHandler(pageReadRepository),
  createPageHandler: new CreatePageHandler(pageWriteRepository),
  updatePageHandler: new UpdatePageHandler(pageWriteRepository),
};
```

---

## Database Access Boundaries — STRICT

Only these two file types may import the database client and execute SQL:
- `infrastructure/persistence/<domain>.read-repository.impl.ts`
- `infrastructure/persistence/<domain>.write-repository.impl.ts`

---

## JSONB Updates — Single-Statement Rule

**Read-modify-write on JSONB columns is forbidden.** Two concurrent requests reading the same JSONB blob, modifying different keys, and writing back will silently overwrite each other's changes. Past PRs have repeatedly flagged this as a CRITICAL race.

### WRONG — read-modify-write

```typescript
// Two concurrent calls clobber each other's slot updates
const row = await sql`SELECT data FROM blocks WHERE id = ${id}`;
const next = { ...row[0].data, [slot]: newValue };
await sql`UPDATE blocks SET data = ${next} WHERE id = ${id}`;
```

### CORRECT — single statement with `jsonb_set`

```typescript
await sql`
  UPDATE blocks
  SET data = jsonb_set(data, ${[slot]}::text[], ${sql.json(newValue)}::jsonb, true)
  WHERE id = ${id}
  RETURNING data
`;
```

### CORRECT — CTE that names the merged value once

```typescript
await sql`
  WITH merged AS (
    SELECT jsonb_set(data, ${[slot]}::text[], ${sql.json(newValue)}::jsonb, true) AS next
    FROM blocks WHERE id = ${id}
  )
  UPDATE blocks SET data = (SELECT next FROM merged) WHERE id = ${id}
`;
```

### Pre-filtering on JSONB text content

When using `LIKE` over a JSONB column cast to text, **always include the JSON key** to avoid matching unrelated values:

```typescript
// WRONG — matches any field whose value contains "X"
WHERE data::text LIKE ${'%' + name + '%'}

// CORRECT — matches only the specific key
WHERE data::text LIKE ${'%"variantName":"' + name + '"%'}
```

The `LIKE` is only a cheap pre-filter — always re-check the match in JS after fetching the row, since substring matching on JSON text is not authoritative.

Nothing else. Not handlers, not controllers, not server components, not server actions.

---

## SQL Typing Rule

`sql` without a type parameter is never allowed. Every query must be explicitly typed.

**The deciding factor: does the type cross a boundary?**

**Named `<Action>Row` type in its own file** — when the query result flows through a read repository interface. The interface, the impl, and the handler all share the type.

```typescript
async findAll(): Promise<GetProjectsRow[]> {
  return sql<GetProjectsRow[]>`SELECT id, name, domain, status, created_at FROM projects`;
}
```

**Inline type** — utility or infrastructure code (seed, migration, script) where the result is used only within that function and has few fields.

```typescript
const rows = await sql<{ id: number }[]>`INSERT INTO projects ... RETURNING id`;
```

**Local interface above the function** — utility code where an inline type would be too verbose.

```typescript
interface ProjectSeedRow { id: number; name: string; }
const rows = await sql<ProjectSeedRow[]>`SELECT id, name FROM projects`;
```

Never use `<action>.row.ts` types in utility/infrastructure code — those belong to the domain read model only.

---

## Error Handling

### Base classes — `src/lib/errors.ts` (saas-backend) / `lib/errors.ts` (app)

**These files do not exist yet. Create them when writing the first handler or VO that needs to throw.**

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// VO-level: input is malformed or invalid
export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); }
}

// Entity not found
export class NotFoundError extends AppError {
  constructor(message: string) { super(message, 404); }
}

// Valid input, but semantically wrong: already exists, DB constraint, business rule violation
export class UnprocessableError extends AppError {
  constructor(message: string) { super(message, 422); }
}

// Concurrent modification / optimistic lock failure
export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409); }
}
```

### Domain-specific errors — `domain/errors.ts` inside each module

Domain errors belong to the domain. Each module defines a base error that extends `AppError` with a default status of 400. Subclasses override the status code and bake in typed parameters and a default message.

```typescript
// modules/project/domain/errors.ts
import { AppError } from '@/lib/errors';

export class ProjectError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}

export class ProjectAlreadyExistsError extends ProjectError {
  constructor(domain: string) {
    super(`A project with domain "${domain}" already exists`, 422);
  }
}

export class ProjectNotFoundError extends ProjectError {
  constructor(id: number) {
    super(`Project ${id} not found`, 404);
  }
}
```

**Rules:**
- VOs throw `ValidationError` (from lib) — input is invalid at the type level.
- Command handlers throw domain-specific errors — `ProjectAlreadyExistsError`, `PageSlugConflictError`, etc. No free-text message strings in handler code.
- Query handlers return `T | null` — never throw for not-found. The caller decides.
- Controllers and server actions catch at the `AppError` level — they do not need to know the specific subclass.
- Never swallow errors. Never leak internal details to the client.

### HTTP status semantics

| Status | When |
|---|---|
| 400 | Malformed request — missing field, wrong type, VO validation failure |
| 404 | Entity does not exist |
| 409 | Concurrent modification, optimistic lock failure |
| 422 | Well-formed but semantically invalid — already exists, DB constraint, business rule violated |
| 500 | Unexpected — anything that is not an `AppError` |

### Express controllers (saas-backend)

```typescript
try {
  const result = await handler.execute(command);
  res.status(200).json(result);
} catch (e) {
  if (e instanceof AppError) {
    return res.status(e.statusCode).json({ error: e.message });
  }
  console.error(e);
  return res.status(500).json({ error: 'Internal server error' });
}
```

### Next.js server actions (app)

```typescript
try {
  await handler.execute(command);
  return { success: true };
} catch (e) {
  if (e instanceof AppError) return { error: e.message };
  console.error(e);
  return { error: 'An unexpected error occurred' };
}
```

---

## TypeScript Rules

- Always explicitly type function parameters and return types on exported functions and class methods.
- Use `interface` for object shapes; `type` for unions, intersections, and utility types.
- No `any`. Use `unknown` with narrowing for untrusted input.
- Prefer string literal unions over `enum`.

---

## Comment Rules

**Default: write zero comments.** Code is read more than it is annotated. Well-named identifiers, small functions, and clear types are the explanation. The codebase is not a wiki.

A comment is justified only when **all three** are true:

1. The reason is **non-obvious from the code itself** — a hidden constraint, a subtle invariant, a workaround for a specific upstream bug, or behaviour that would surprise a reader.
2. Removing the comment would **mislead a future reader or cause a regression** — not just deprive them of trivia.
3. The information has **no better home** (see *Where domain rules live* below).

If a comment fails any of those three, delete it.

### Where domain rules live — NOT in source comments

Domain rules, cascade rules, ordering invariants, "how this concept works" explanations, and architecture rationale belong in `.md` docs:

- `.claude/skills/app/domain/<module>.md` — domain rules for an `app/` module
- `.claude/skills/saas-backend/domain/<module>.md` — same for `saas-backend/`
- `.claude/skills/shared/<topic>.md` — cross-cutting topics
- the relevant PRD (`.claude/PRPs/prds/`) — one-time decisions tied to a feature

If you find yourself writing a multi-paragraph comment block to explain how a system works, **stop**. Move it to the appropriate `.md` doc and reference the doc from the code only if the location is genuinely ambiguous. A function named `resolveVariantStyles` does not need a comment explaining the cascade — the cascade is documented in the variants domain doc.

### Banned in source code

- Section banners (`// ─── Foo ───`, `// === Bar ===`) — file structure should already be obvious; if it isn't, split the file
- Restating the function signature or what an obvious branch does (`// returns null if not found`, `// loop over items`)
- Multi-paragraph rationale, cascade rules, ordering guarantees, ECMA-spec citations — these go in `.md` docs
- Console warnings/logs for **expected** behaviour (e.g. a `findX` function returning null when X is missing — that is the documented contract, not an anomaly)
- `// Phase N` / `/* Phase N */` / `// PR #N` / `// from PR #N` — references the build process, not the code; git history is authoritative
- `// as of <date>` / `// 2025-...` / `// added for X feature` — timestamps and feature labels belong in commits
- `// TODO(later)` without a tracker link
- JSDoc on internal helpers whose body is shorter than the doc

### Acceptable in source code

Short, single-line, load-bearing comments only:

- `// Workaround: postgres.js v3 returns Date for TIMESTAMPTZ even when ::text cast`
- `// Required for the JSONB upsert race condition — see <function-name>`
- `// FIXME: <ticker>-123 — <short why>`
- A 1-line pointer to a doc when the rule is non-trivial: `// Cascade rules: see .claude/skills/app/domain/variants.md`

### Tests

Tests get slightly more latitude — short comments labelling **arrange / act / assert** sections, or naming a non-obvious fixture intent, are fine. Long-form rationale still belongs in the test name (`it('throws when …')`) or a doc, not in a comment.

### Anti-patterns to delete on sight

- A `console.warn` (or `console.log`) describing expected behaviour — delete it. Functions named `findX`, `getOptionalY`, `tryZ` are contracts that explicitly allow the absent case.
- A 5-line block comment that says the same thing the next 3 lines of code already say.
- A comment that explains a domain rule in prose. Move the prose to `.md`; leave the code uncommented.
- Reaching for a comment to "help future Claude understand". Future Claude reads the doc + the code. If the doc is missing, write the doc.

If you cannot delete the comment without making the code wrong or seriously confusing, keep it. Otherwise, delete.

---

## When to Create a New Module

A concept deserves its own module when it:
- Has its own DB table and lifecycle (created, updated, deleted independently)
- Crosses aggregate boundaries — references other aggregates by ID only, not by value
- Has domain rules that do not belong in any existing module

Do not split because a module is large. Split when the concern is genuinely separate.
