---
name: web-components
description: >
  Component rules for all frontend services. When to create a component, tier
  structure, authoring conventions, API design, and co-location policy. Always
  read before writing any HTML inside .tsx files. Check the service-specific
  component registry before writing any markup.
---

# Web Components

## Core Rule

> **If an HTML element has a name a designer would give it — it is a component. Never written inline.**

Inline HTML is reserved for layout scaffolding only: wrapper divs, flex/grid containers, spacing elements with no semantic role. Everything else is a component.

**Quick test:** _"Does this element have a name a designer would give it?"_
If yes (Button, Table, Badge, Avatar, Modal…) → look it up in the service registry. Create it if it doesn't exist. Never write it inline.

---

## STOP — Check Before Writing Any HTML Element

Before writing ANY of the following elements, stop and check the service component registry:

| Raw element | Use instead |
|---|---|
| `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` | `Table` component |
| `<textarea>` | `Textarea` component |
| `<input>` (except `type="hidden"`) | `Input` component |
| `<select>` | registered select component |
| `<a>` styled as a button | `Button` with `href` prop |
| `<button>` | `Button` component |
| Error/warning/info message divs | `MessageBlock` component |
| Empty state divs | `EmptyState` component |

**`type="hidden"` inputs are exempt** — they are infrastructure, not design elements.

If the component doesn't exist in the registry yet: create it first, add it to the registry, then use it. Never write the raw element inline as a shortcut.

---

## Component Registry

**Before writing any markup, check the registry for your service.**

| Service | Registry |
|---|---|
| `app/` | `.claude/skills/app/components.md` |
| `platform-ui/` | `.claude/skills/platform-ui/components.md` |

**After creating a new component, add it to the registry immediately.** An unregistered component will be re-invented by the next task.

---

## Tier Structure

All services use `src/components/` as the component root.

> **Note:** `platform-ui` currently places components at `components/` (no `src/`). This is a known structural debt — it should be moved to `src/components/` when convenient. Until then, treat `platform-ui/components/` as the root for that service.

```
src/components/
├── ui/          Tier 1 — generic building blocks (Button, Input, Table, Icon)
├── composed/    Tier 2 — composed generics specific to this product's identity
└── modules/
    └── <domain>/  Tier 3 — domain-coupled components (accept domain entities)
```

| Criterion | `ui/` | `composed/` | `modules/` |
|---|---|---|---|
| Single-purpose building block | ✓ | ✗ | ✗ |
| Composed from ui/ primitives, but generic | ✗ | ✓ | ✗ |
| Contains business logic or domain types | ✗ | ✗ | ✓ |
| Accepts domain entities as props | ✗ | ✗ | ✓ |
| Would make sense in any other project | ✓ | ✓ | ✗ |

---

## When to Create a Component

An element warrants a component when it has **surface area** — it can vary, carry state, or behave differently in different contexts.

**Always a component:**
- Can it look different in different situations? (variants, size, color)
- Can it be disabled, loading, or have an error state?
- Does it contain or trigger logic?
- Would you ever need to change it consistently across the codebase?

**Never write inline:**
- `<a>` styled as a button → `<Button href="...">`
- `<table>` with hardcoded rows → `<Table>` with a data prop
- `<input>` / `<select>` / `<textarea>` → form components
- Status text with color logic → `<Badge>`
- Any element appearing more than once in the codebase
- Any element with extensive styling, calculations, or logic
- **Same structure, same UX, same domain function — only the text/icon differs → one component with a prop.** Never copy-paste the markup; pass the varying content as a prop. This applies even within a single sub-module: scope (local vs. global) is not a reason to duplicate.

**Acceptable inline:**
```tsx
// Layout scaffolding — no semantic role, no design name
<div className="flex items-center gap-4">
  <UserAvatar user={user} />
  <Button text="Save" onClick={handleSave} />
</div>
```

---

## Component API Design

Props use **explicit, typed interfaces**. No spreading unknown HTML attributes by default.

Model every variation explicitly using discriminated unions:

```tsx
interface BaseButtonProps {
  icon?: IconName;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
}

interface ButtonWithTextProps extends BaseButtonProps {
  text: string;
  href?: string;
}

interface IconOnlyButtonProps extends BaseButtonProps {
  text?: never;
  label: string; // required for accessibility
}

type ButtonProps = ButtonWithTextProps | IconOnlyButtonProps;
```

Prefer explicit, named props over `children: ReactNode`. `children` is not an API — it is the absence of one.

**Acceptable uses of `ReactNode`:** true layout/container components (Card, Modal) where arbitrary content is the purpose, and semantic slots where restricting the type would require a wrapper with no real benefit — e.g. an `icon` prop that accepts any icon component. Use common sense; don't write a type guard just to avoid `ReactNode`.

Before creating a new component, ask: **is this a variant or prop combination of an existing component?** A `<BackButton>` is just `<Button text="Back" icon="arrow-left" href="..." />`.

---

## Co-location Policy

Each file has a single primary component. Additional components in the same file are allowed only when they are:
- Tightly coupled to the main component
- Not reused elsewhere
- Purely presentational or structural helpers

If a component becomes reusable or conceptually independent, extract it to its own file.

---

## Client-Side Error Handling

Component code (event handlers, effects, click handlers, server-action callers) **must not silently swallow errors**. The two recurring anti-patterns from past reviews:

```tsx
// WRONG — silent fallback hides the failure from logs and users
const items = await fetchItems().catch(() => []);

// WRONG — empty catch loses the error entirely
try {
  await saveDraft(payload);
} catch {}
```

```tsx
// CORRECT — log with context, then return the fallback
const items = await fetchItems().catch((error) => {
  console.error('[ItemsList] fetchItems failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  return [];
});

// CORRECT — log, surface to UI, do not swallow
try {
  await saveDraft(payload);
} catch (error) {
  console.error('[Editor.handleSave] saveDraft failed', {
    pageId: page.id,
    error: error instanceof Error ? error.message : String(error),
  });
  setError('Could not save your draft. Try again.');
}
```

**Required minimum** for every catch in a component or server-action caller:
1. `console.error` with at least: `[<Component>.<handler>]` tag, key context (`id`, `slug`, etc.), and the error message.
2. Either re-throw, surface the error to UI state, or explicitly return a typed fallback. Never just `catch {}`.

**Banned patterns** (treat as compile-time errors during review):
- `catch {}`
- `catch (e) {}` with empty body
- `.catch(() => <fallback>)` without a logging call
- `console.warn` (not `console.error`) for data-integrity events

---

## SSR-Unsafe Values

Never format dates inline in render — server timezone ≠ browser timezone → hydration mismatch. Use `<FormattedDate iso={...} />` (`src/components/ui/formatted-date/FormattedDate.tsx`, exists in both `app/` and `platform-ui/`). It renders `—` during SSR and formats in the user's local timezone after mount.

Same rule applies to any locale-sensitive value (`Intl.NumberFormat`, etc.).

---

## Test Requirement

**Every component has a co-located `.test.tsx`. A component without a test file is incomplete and must not be committed.**

When creating a component:
1. Write the component
2. Write the `.test.tsx` immediately — at minimum a render test
3. Add to the service registry
4. Use it in the original location

---

## When a Component Doesn't Exist Yet

1. Check the service registry — it may exist under a different name.
2. Decide tier: generic building block → `ui/`; composed generic → `composed/`; domain-coupled → `modules/<domain>/`.
3. Create the component with a typed props interface.
4. Create the co-located `.test.tsx`.
5. Add it to the registry.
6. Use it.

Do not defer registry updates.
