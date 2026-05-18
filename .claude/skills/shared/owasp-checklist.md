---
name: owasp-checklist
description: >
  OWASP Top 10 (2021) mapped to this codebase. For each category: brief
  threat description, existing rules that already cover it, real gaps in
  this repo, and what to do about each gap. Read before any change that
  touches authn/authz, user input handling, secrets, file uploads, API
  endpoints, or external HTTP calls.
---

# OWASP Top 10 — Repo-Specific Checklist

This file consolidates OWASP guidance into one place rather than 10 separate
ones. Each category lists three things: **what the threat is**, **where in
this repo we already enforce it**, and **what's still a gap**.

When reviewing or writing security-sensitive code, work this list top-down
and check the relevant section. When `/di-build-v2` Step 5.4 (security scan)
runs, this is the strategic-layer companion to the tactical layer
(`eslint-plugin-security`, `gitleaks`, `ddd-cqrs.md` rules).

---

## A01:2021 — Broken Access Control

**Threat:** users acting outside their permissions — bypassing tenant
isolation, accessing other tenants' data, escalating roles, manipulating
hidden form fields, IDOR (Insecure Direct Object Reference).

**Where we cover it:**
- Multi-tenant isolation is the platform's reason to exist. Each tenant
  gets its own provisioned `app/` instance via the kubernetes-provisioner
  chart — physical isolation, not shared-DB row-filtering. See
  `infra/charts/app-tenant/`.
- `saas-backend` admin routes use the `api-token` module for per-tenant
  authentication. See `saas-backend/src/modules/api-token/`.
- Server actions in `app/` and `platform-ui/` are the canonical write
  surface — never expose mutation endpoints client-side.

**Gaps to watch:**
- `app/`'s admin routes (`/admin/*`) currently rely on session-based auth
  alone; there is no role/permission system above "logged-in admin". When
  multiple operators land, this needs RBAC (a domain layer + role checks
  in handlers).
- IDOR risk on any handler that takes an `id` from the URL/payload and
  doesn't verify the resource belongs to the current tenant. **Pattern
  to enforce:** every command/query handler that accepts `id` of a
  tenant-scoped resource must validate `resource.tenantId === ctx.tenantId`
  before acting. Today this is implicit (one tenant per provisioned
  instance); when multi-tenant-per-instance ever ships, it becomes
  explicit and load-bearing.

**Do:** scope every read/write by tenant in the SQL itself, not in
post-fetch filtering. Document any handler that takes a raw `id` with a
`# Auth boundary` comment block describing how authorization is enforced.

**Don't:** trust client-supplied IDs without verification. Don't rely
on "the UI doesn't show this option" — clients can call any handler.

---

## A02:2021 — Cryptographic Failures

**Threat:** sensitive data in transit/at-rest without proper protection —
weak hashes, predictable tokens, missing TLS, leaked credentials, secrets
in logs.

**Where we cover it:**
- `gitleaks` (CI workflow `secrets.yml` + local pre-commit recommended)
  catches accidentally-committed secrets.
- `eslint-plugin-security`'s `detect-pseudo-randomBytes` flags
  `Math.random()` used where crypto-grade randomness is required.
- Skill rule: **never hardcode secrets** — see
  `~/.claude/rules/typescript/security.md`. All secrets via
  `process.env.*` with explicit existence-check at boot.

**Gaps to watch:**
- API tokens (`saas-backend/src/modules/api-token/`) — verify the token
  generation uses `crypto.randomBytes`, not `Math.random()`. Verify the
  hashing scheme (bcrypt / argon2 / sha-256 with HMAC). Plain SHA-256
  with no salt is broken; if that's what's in use, fix it.
- Verify TLS is enforced end-to-end at the Traefik layer, not optional.
  See `infra/charts/traefik/`.

**Do:** generate tokens via `crypto.randomBytes(32).toString('hex')`.
Hash secrets with bcrypt (cost ≥ 12) or argon2id at rest. Use `HMAC` for
non-credential signatures (e.g. webhook validation). Never log token
values or secrets — log lengths and prefixes only.

**Don't:** use `Math.random()` for anything security-related. Don't
roll your own crypto — use Node's `crypto` module or a battle-tested
library (`bcrypt`, `argon2`, `jose`).

---

## A03:2021 — Injection

**Threat:** SQL injection, command injection, LDAP injection, XSS via
unescaped user input.

**Where we cover it:**
- `postgres` (porsager) tagged-template SQL — the dominant repository
  pattern in `app/` and `saas-backend/`. Tagged templates parameterize
  by default. See `.claude/skills/shared/ddd-cqrs.md` "SQL Typing Rule"
  and the JSONB Single-Statement Rule.
- React's default escaping handles most XSS. **Never use
  `dangerouslySetInnerHTML`** unless the input is sanitized via
  `DOMPurify`.
- `eslint-plugin-security`'s `detect-non-literal-regexp`,
  `detect-eval-with-expression`, and `detect-child-process` flag the
  classic injection sources.

**Gaps to watch:**
- Dynamic SQL via `sql.unsafe()` — every call site is a potential SQL
  injection. Audit them quarterly; only acceptable when the SQL string
  is fully constant or parameterized via the postgres.js value-binding
  mechanism inside `unsafe()`. A migration `up()` / `down()` using
  `unsafe()` for DDL is fine; a query handler using `unsafe()` is
  almost always wrong.
- Markdown rendering for user-supplied content — verify any markdown
  pipeline runs through DOMPurify or a renderer that escapes by default.
- The `LIKE '%name%'` JSONB pre-filter rule (in `ddd-cqrs.md`) — text
  substring matching on JSON columns is brittle and can leak data
  across keys; always include the JSON key in the LIKE pattern.

**Do:** parameterize every SQL query via tagged templates. Sanitize
all HTML coming from the database before injecting into the DOM (use
DOMPurify). Cast user input to the right TypeScript type at the
boundary via Zod or VO constructors.

**Don't:** build SQL via string concatenation. Don't trust user-supplied
HTML. Don't use `eval`, `Function()` constructor, or `child_process.exec`
with user input.

---

## A04:2021 — Insecure Design

**Threat:** flaws in the design itself — missing rate limits, no
abuse-resistance, secrets stored in URL params, predictable IDs.

**Where we cover it:**
- DDD/CQRS architecture (`.claude/skills/shared/ddd-cqrs.md`) forces a
  command/query split — write paths can't be invoked by a query.
- The "Command DTO vs Command" rule prevents accidentally trusting raw
  HTTP shape inside business logic.
- Kubernetes-level tenant isolation prevents one tenant's misbehaviour
  from affecting another's data.

**Gaps to watch:**
- **No rate limits** on any HTTP endpoint today. Brute-forcing the admin
  login or token-auth endpoint is currently rate-unlimited. Add
  per-IP + per-account rate limits at the Traefik or Express layer
  (e.g. `express-rate-limit`).
- **Predictable resource IDs** (`SERIAL` columns) make enumeration easy.
  Where applicable (especially anything user-discoverable), use UUIDs or
  random short codes. Tenant-internal resources are fine with serials;
  publicly-listable resources are not.

**Do:** rate-limit any endpoint that accepts a credential or external
input. Treat resource enumerability as a threat — use UUIDs or
nanoids for anything ever exposed to a non-owning user.

**Don't:** assume "no one will guess this URL" — enumeration scripts
are cheap. Don't store sensitive state in URL parameters.

---

## A05:2021 — Security Misconfiguration

**Threat:** default credentials, verbose error messages exposing internals,
unnecessary services running, missing HTTP security headers, debug mode
in production.

**Where we cover it:**
- Helm charts for `app-tenant`, `saas-backend`, `platform-ui`,
  `postgresql` keep config in versioned YAML — no hand-tweaked prod
  state.
- Error handling in handlers (`ddd-cqrs.md`): `AppError` wrappers
  prevent raw stack traces from leaking to clients.
- The new client-side error-handling rule in `web-components.md` blocks
  silent error swallowing — all errors are logged with structured
  context, not lost.

**Gaps to watch:**
- **HTTP security headers not centrally enforced.** Add `helmet` (or
  the Next.js equivalent) to set `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Strict-Transport-Security`, `Content-Security-Policy`.
  These should land per-service or at the Traefik middleware layer.
- **CSP is not configured.** A nonce-based CSP for any UI surface
  blocks XSS escalation paths even when input sanitization fails.
- **Default DB credentials** in `docker-compose.yml` for local dev
  should never propagate to any deployed environment. Helm values
  must override; verify per-tenant secrets are mounted, not baked.

**Do:** set all standard security headers at the edge. Add CSP with a
per-request nonce for any HTML response. Verify production env vars
override every dev default.

**Don't:** leave default `postgres / postgres` credentials anywhere
that ships to a deployed env. Don't return raw error messages to
clients — wrap them in `AppError` with sanitized text.

---

## A06:2021 — Vulnerable and Outdated Components

**Threat:** dependencies with known CVEs.

**Where we cover it:**
- **Dependabot alerts** — enable in repo Settings → Code security → Dependabot
  alerts. Free for private repos on Pro.
- **Dependabot security updates** — auto-PRs for patch-level CVE fixes.
  Same Settings page.
- `yarn.lock` pinning ensures every install is identical.

**Gaps to watch:**
- No `yarn audit` in CI today. Add it to `.github/workflows/test.yml`
  per service as a non-blocking step (output is informational; reviewer
  decides). Or rely entirely on Dependabot.
- Manual review of major-version bumps — Dependabot doesn't auto-merge
  major bumps; treat them as breaking changes.

**Do:** turn on Dependabot alerts and auto-updates in repo Settings.
Run `yarn audit` locally before any release. Pin transitive dep ranges
in `resolutions` for any CVE that Dependabot can't auto-fix.

**Don't:** ignore Dependabot alerts. Don't blindly merge a major-version
auto-PR — read its changelog first.

---

## A07:2021 — Identification and Authentication Failures

**Threat:** weak passwords, no MFA, predictable session IDs, missing
brute-force protection, exposed session tokens, broken password reset.

**Where we cover it:**
- `saas-backend/src/modules/api-token/` is the canonical auth module.
  All token issuance / verification flows through it.
- Domain errors: `AdminUserAlreadyExistsError`, the verification-token
  invalidation pattern in `ddd-cqrs.md` Event Handler section. Token
  reuse is prevented by marking tokens used inside the same transaction
  as the action they authorize.

**Gaps to watch:**
- **No MFA / 2FA today.** When the platform admits real customers,
  this becomes a hard requirement (TOTP via `otplib` is the cheap path).
- **No brute-force lockout** on admin login. Add rate limits + account
  lockout after N failed attempts within a window.
- **No password complexity enforcement** if/when password auth is
  added. Today auth is token-based; if passwords arrive, enforce
  zxcvbn-style strength (≥3) and a haveibeenpwned check.
- **Session expiration policy** — verify cookies have a sane Max-Age,
  HttpOnly, Secure, SameSite=Strict.

**Do:** rotate API tokens on any suspected compromise. Use HttpOnly +
SameSite=Strict cookies. Add MFA before onboarding a real customer.
Lockout after 5 failed attempts in 15 minutes.

**Don't:** roll your own auth from scratch — use NextAuth /
Lucia / better-auth. Don't store session tokens in localStorage
(XSS-readable).

---

## A08:2021 — Software and Data Integrity Failures

**Threat:** insecure deserialization, unsigned packages, CI/CD pipeline
compromise, untrusted plugins.

**Where we cover it:**
- `yarn.lock` checksum verification on `--frozen-lockfile`.
- GitHub Actions pinned by version (`@v4`, `@v3`) — though this is
  weaker than pinning by commit SHA.
- `gitleaks` catches accidentally-committed CI tokens.

**Gaps to watch:**
- **GitHub Actions pinned by tag, not SHA.** Tag-pinning is mutable —
  a maintainer can repoint `v4` to anything. For sensitive workflows
  (deploys, secret-scoped jobs), pin to a SHA: `uses: actions/checkout@b4ffde65f...`.
  For low-risk Actions like `paths-filter`, tag-pinning is acceptable
  with Dependabot watching for updates.
- **No supply-chain provenance** (SLSA / Sigstore) — overkill for current
  stage but worth revisiting before going public.

### Named Rule

**The Allowlist `permissions:` Rule.** When a GitHub Actions workflow
sets a `permissions:` block explicitly, **every permission NOT listed
silently defaults to `none`** — not to whatever the repo or job
defaults are. This is allowlist semantics, not denylist. Listing
`contents: read` alone makes `pull-requests`, `issues`, `actions`,
`id-token`, etc. all `none`. Caught the hard way on PR #88's first run
when `gitleaks-action` 403'd on `GET /pulls/<n>/commits` because the
workflow only granted `contents: read`. Always enumerate every
permission the action's docs list — read for the ones it just
consumes, write for the ones it reports back to (PR comments,
check runs, status updates).

**Do:** pin sensitive Action steps by commit SHA. Verify any third-party
package's reputation before adding it (downloads, last commit, open
issues). Enumerate every permission an Action needs in the workflow's
`permissions:` block — never assume defaults will fill in the gaps.

**Don't:** `curl | bash` install steps in CI. Don't deserialize
user-supplied data with `eval`, `Function()`, or unsafe YAML loaders.
Don't set a partial `permissions:` block thinking it'll inherit the
rest from the repo default — it won't.

---

## A09:2021 — Security Logging and Monitoring Failures

**Threat:** breaches go undetected because nothing was logged, or logs
exist but no one looks at them.

**Where we cover it:**
- `ddd-cqrs.md` Event Handler Error Handling rule: write phase failures
  must propagate, notification phase failures get logged. Never swallow.
- New Client-Side Error Handling rule in `web-components.md`: bans
  `catch {}` and `.catch(() => fallback)` without `console.error`.
- All errors flow through `AppError` so they have structured context.

**Gaps to watch:**
- **No central log aggregation.** `console.log` / `console.error` go to
  container stdout. There's no Datadog / Loki / CloudWatch pipeline.
  When a breach happens, forensics will be hard.
- **No audit log** of admin actions. Adding even a minimal append-only
  audit trail (who did what, when, against which tenant) gives huge
  forensic value for low cost.
- **No alerting** on auth failures, 5xx spikes, or unusual data-egress
  patterns.

**Do:** wrap every error in `AppError` with structured context. Log
authn events (success + failure) with IP and user-agent. Treat audit
log writes as a separate phase (best-effort like notifications, but
durable enough that we know if it failed).

**Don't:** log raw passwords, tokens, secrets, or PII. Don't truncate
error messages — the whole stack matters in forensics. Don't trust
client-supplied timestamps for audit ordering.

---

## A10:2021 — Server-Side Request Forgery (SSRF)

**Threat:** server fetches a URL controlled by the attacker, who points
it at internal services (`http://localhost:6379`, AWS metadata at
`169.254.169.254`, internal admin panels).

**Where we cover it:**
- Today: minimal exposure. The app/saas-backend don't accept user-supplied
  URLs for outbound fetches in any current code path.

**Gaps to watch (when these arrive):**
- **Webhooks** — any feature that calls a tenant-supplied callback URL
  is a textbook SSRF surface. Block private IP ranges (`10.0.0.0/8`,
  `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`,
  IPv6 link-local) at the request layer. Use `ssrf-req-filter` for
  Node.
- **Image / asset fetching** — any "fetch a URL the tenant pasted" UX
  needs the same private-IP block + a content-type allow-list (only
  `image/*` for image inputs).
- **Server-side previews / OEmbed** — same threat as image fetching.

**Do:** block private IP ranges + DNS rebinding (resolve once, reuse
the IP). Allow-list response content types. Cap response size and
timeout aggressively.

**Don't:** fetch a tenant-supplied URL without the above guards. Don't
follow redirects across origin boundaries without re-validating.

---

## How this checklist composes with the rest of the harness

| Layer | What it does | Where |
|---|---|---|
| **Strategic (this file)** | OWASP Top 10 mapped to this codebase + gap list | `.claude/skills/shared/owasp-checklist.md` |
| **Tactical (write-time)** | Pattern bans on dangerous code idioms | `ddd-cqrs.md`, `web-components.md`, `eslint-plugin-security` |
| **Tactical (commit-time)** | Secret detection on staged diff | `gitleaks` + `.gitleaks.toml` |
| **Tactical (CI-time)** | Secrets enforcement + dep CVE alerts | `.github/workflows/secrets.yml` + GitHub Settings → Dependabot |
| **Architectural** | Tenant isolation, command/query split | `infra/`, `ddd-cqrs.md` |

When `/di-build-v2` Step 5.4 runs, it consults this file for the
**strategic** check ("does the change cross any A01-A10 boundary?")
before letting the tactical checks act as the enforcement floor.

## When to update this file

- A new OWASP Top 10 list ships (most recent: 2021; next expected ~2025).
  Refresh the category headings and re-map gaps.
- A real incident or near-miss surfaces a gap not listed here.
- A skill file gets a new rule that closes a "Where we cover it" gap —
  cross-reference the new rule from the relevant section.
