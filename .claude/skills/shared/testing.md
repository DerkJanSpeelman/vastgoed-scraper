---
name: testing
description: >
  Testing mandate, DONE gate, per-layer coverage rules, and test patterns for
  all services. Read before writing any new file. A task is not complete until
  the DONE gate passes.
---

# Testing

## DONE Gate — task is NOT complete until ALL pass

For every new file created in a task:

| New file | Required test file |
|---|---|
| `*.handler.ts` (command or query) | `.handler.test.ts` co-located |
| `*.vo.ts` | `.vo.test.ts` co-located |
| `*.entity.ts` | `.entity.test.ts` co-located |
| `*.mapper.ts` | `.mapper.test.ts` co-located |
| `*.controller.ts` | `.controller.test.ts` co-located |
| `*.tsx` component | `.test.tsx` co-located |

**A file without its test file is incomplete. It must not be committed.**

After writing tests: `make test-file files="<test file path>"` — all must pass.
After all changes: `make typecheck` — must pass with zero errors.

Coverage target: **80%** across all layers. Run `make test-coverage` to check.

---

## Test Tools

| Package | saas-backend | platform-ui | app |
|---|---|---|---|
| Test runner | Jest 29 | Jest 30 | Jest 30 |
| TypeScript transform | ts-jest (ESM preset) | next/jest (SWC) | next/jest (SWC) |
| DOM environment | node | jest-environment-jsdom | jest-environment-jsdom |
| Component testing | — | React Testing Library | React Testing Library |
| DOM matchers | — | @testing-library/jest-dom | @testing-library/jest-dom |

---

## What to Test Per Layer

### saas-backend & app — unit tests (always)

| Layer | Test | What to verify |
|---|---|---|
| Value objects | `*.vo.test.ts` | Valid inputs pass; every invalid case throws `ValidationError` |
| Entities | `*.entity.test.ts` | Domain invariants; verify the factories the entity actually exposes (`create()` if present, `existing()` if present) |
| Write mappers | `*.mapper.test.ts` | `toDomain` round-trips correctly; `toPersistence` extracts raw values |
| Read mappers | `*.mapper.test.ts` | `toDto` converts snake_case → camelCase; all fields present |
| Command handlers | `*.handler.test.ts` | Mock write repo; verify correct calls and return value |
| Query handlers | `*.handler.test.ts` | Mock read repo; verify mapping and null handling |
| Controllers | `*.controller.test.ts` | Mock handler deps; test HTTP status codes and response shape |

### saas-backend & app — integration tests (selective)

| Layer | When |
|---|---|
| Repository impls | SQL correctness requires a real DB — only when logic is non-trivial |
| Routes + middleware | Requires Express app mounted |

### Do NOT test

- DTOs — plain data shapes, no logic
- Command/query classes — plain data shapes, no logic
- Container files — composition root, covered by integration tests implicitly
- `<domain>.table.ts` — type declarations only

### platform-ui — unit tests (always)

- **Every component** in `components/` has a co-located `.test.tsx`
- API client (`lib/api/`) — mock `fetch`, verify URL, headers, response parsing, error handling
- Utility functions — pure logic

### platform-ui — integration tests (optional)

Pages or layouts with non-trivial data fetching. Most pages are thin wrappers — skip.

---

## Negative-Path Test Checklist (REQUIRED)

Happy-path-only tests are the #1 source of `/review-pr` MEDIUM/LOW findings in this repo. For every new pure helper, handler, repository method, mapper, or VO, the test file MUST cover the relevant negative paths from this list:

| Path | When required |
|---|---|
| **Empty input** (`[]`, `{}`, `''`, `null`, `undefined`) | Any function accepting collections, strings, or optional values |
| **Duplicate input** | Any function that adds-to or merges collections, or guards against name conflicts |
| **Nested input** | Any function that traverses a tree, recurses, or operates on JSONB |
| **Validation rejection** | Every VO constructor — for each invalid case, assert `ValidationError` is thrown |
| **No-op input** (input that should produce no change) | Any merge / patch / update function — assert the result is structurally equal to input, not a new mutated copy |
| **Conflict / collision** (e.g. renaming to a name that already exists) | Any handler that enforces uniqueness |
| **Partial-empty** (some fields populated, others empty) | Any function that strips or normalizes optional fields |

**Done gate amendment:** a test file is incomplete if its only `it(...)` cases are happy-path. The TDD agent must verify the relevant negative-path rows are covered before declaring tests done.

This is not exhaustive — it is the floor. Domain-specific edge cases still apply on top.

---

## saas-backend: ESM Setup

- Config: `jest.config.mjs` (not `.ts`)
- All scripts: `NODE_OPTIONS='--experimental-vm-modules' jest`
- Transform: `ts-jest` with `useESM: true` and `moduleResolution: node16`
- **Import Jest globals explicitly:** `import { describe, it, expect, jest } from '@jest/globals'`

---

## saas-backend: Controller Test Pattern

Controllers use `createXxxController(deps)`. Tests pass plain mock objects — no `jest.mock()` needed.

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { createProjectController } from './project.controller';

const mockGetProjectsHandler = { execute: jest.fn() };
const mockCreateProjectHandler = { execute: jest.fn() };

const { getProjects, createProject } = createProjectController({
  getProjectsHandler: mockGetProjectsHandler,
  createProjectHandler: mockCreateProjectHandler,
});
```

---

## saas-backend & app: Handler Test Pattern

Mock the repository interface — no real DB, no `jest.mock()`.

Two categories of errors come out of handlers:
- **`ValidationError`** — thrown by a VO constructor when input is malformed. Propagates through the handler unchanged.
- **Domain-specific errors** — thrown by the handler itself for business rule violations (`PageSlugConflictError`, `AdminUserAlreadyExistsError`, etc.).

Test both.

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { CreatePageHandler } from './create-page.handler';
import { ValidationError } from '@/lib/errors';
import { PageSlugConflictError } from '@/lib/modules/pages/domain/errors';

const mockRepo = { save: jest.fn(), existsBySlug: jest.fn() };
const handler = new CreatePageHandler(mockRepo);

describe('CreatePageHandler', () => {
  it('saves page and returns id', async () => {
    mockRepo.existsBySlug.mockResolvedValue(false);
    mockRepo.save.mockResolvedValue(1);
    const id = await handler.execute({ slug: '/about', title: 'About' });
    expect(id).toBe(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws ValidationError when slug is malformed (VO rejects)', async () => {
    await expect(handler.execute({ slug: 'no-slash', title: 'Bad' }))
      .rejects.toThrow(ValidationError);
  });

  it('throws PageSlugConflictError when slug is already taken (business rule)', async () => {
    mockRepo.existsBySlug.mockResolvedValue(true);
    await expect(handler.execute({ slug: '/about', title: 'About' }))
      .rejects.toThrow(PageSlugConflictError);
  });
});
```

---

## platform-ui & app: Component Test Pattern

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button text="Save" />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button text="Save" onClick={handleClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Mocking conventions:**
- Mock `next/navigation` for components using `useRouter` or `usePathname`
- Mock `lib/api/` for form components that call the API
- Mock `next/link` when testing click behavior on components that use `<Link>`

---

## File Naming Convention

| Type | Suffix | Location |
|---|---|---|
| Unit test | `*.test.ts` / `*.test.tsx` | Co-located next to source file |
| Integration test | `*.integration.ts` | Co-located next to source file |

Never put tests in a top-level `__tests__/` directory.
