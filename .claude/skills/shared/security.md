---
name: security
description: >
  Security rules and OWASP checklist for all services. Stack-specific — covers
  SQL injection, XSS, auth, multi-tenant isolation, input validation, and
  secrets. Check before closing any task that touches routes, handlers, auth,
  infrastructure configuration or user input.
---

# Security

## DONE Gate — check before closing any task that touches:
- A new route or endpoint
- Authentication or authorization logic
- User input (form, query param, request body)
- Database queries
- File system operations
- Secrets or environment variables

---

## SQL Injection

**Not a risk with porsager `postgres`** — template literals are parameterized automatically:

```typescript
// Safe — value is parameterized, never interpolated into SQL string
const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
```

**Never** build SQL strings manually:

```typescript
// NEVER — direct string interpolation
const rows = await sql`SELECT * FROM projects WHERE id = ` + id;
```

---

## XSS — `dangerouslySetInnerHTML`

The `app` service renders page content as HTML via `dangerouslySetInnerHTML`. This must always go through DOMPurify sanitization before render.

```typescript
// Always sanitize before rendering user HTML
import DOMPurify from 'isomorphic-dompurify';
const safeContent = DOMPurify.sanitize(page.content);
<div dangerouslySetInnerHTML={{ __html: safeContent }} />
```

Never render unsanitized content from the database. The admin writes HTML directly — it is untrusted input.

---

## Authentication

Authentication is domain-specific. Each service documents its own auth mechanism in the relevant domain skill. Do not implement auth without first reading the domain skill.

- **saas-backend ↔ app**: API token via `Authorization: Bearer <token>`. See `.claude/skills/saas-backend/domain/api-token.md`.
- **app admin sessions**: JWT in an httpOnly cookie. See `.claude/skills/app/domain/admin-users.md`.

**Cross-cutting rules that apply everywhere:**
- Raw tokens are never stored — only SHA-256 hashes.
- Passwords are never stored in plaintext — bcrypt, minimum cost factor 12.
- Never expose admin or internal handlers without auth enforcement.
- Auth mechanism details live in the domain skill, not here.

---

## Multi-Tenant Isolation

Each tenant (`app` instance) has its own isolated PostgreSQL database. The platform DB (`saas-backend`) must never expose one tenant's data to another.

- Tenant DB connections are scoped per-instance via environment variables injected at provisioning time.
- The `slug` used for Helm release names is validated by `ProjectDomain` VO before use — prevents injection into Helm `--set` values.
- Never accept a `tenantId` or `slug` from user input and use it directly in provisioning — always derive it from a validated domain entity.

---

## Secrets and Environment Variables

- No secrets in source code. No API keys, tokens, or passwords committed.
- All secrets via environment variables validated at startup.
- `API_TOKEN` is per-tenant, injected as a Kubernetes Secret. Never logged.
- `SKIP_SAAS_AUTH=true` is Docker Compose only — never set in Kubernetes.

---

## Input Validation

Validate at the HTTP boundary before constructing domain objects:

- **saas-backend controllers**: validate required fields exist in `req.body` before constructing the command. Return 400 if fields are missing.
- **app server actions**: validate form data before constructing commands.
- Value objects handle domain-level validation (format, length, characters). Controllers handle presence.

---

## Error Responses

- Never expose stack traces, internal error messages, or DB error details to the client.
- `AppError` subclasses have safe, user-facing messages — use those.
- Unexpected errors (`catch (e)` where `e` is not an `AppError`) always return a generic 500 message.
- Log unexpected errors server-side with full context. Until a structured logger is introduced, `console.error` is explicitly permitted for this purpose. `console.log` is never acceptable.

---

## OWASP Top 10 — Stack Relevance

| Risk | Relevance | Mitigation |
|---|---|---|
| A01 Broken Access Control | HIGH | Admin route auth; API token validation; tenant isolation |
| A02 Cryptographic Failures | MEDIUM | bcrypt passwords; SHA-256 token hashing; no plaintext secrets |
| A03 Injection | LOW (mitigated) | porsager template literals; `ProjectDomain` VO for slug sanitization |
| A04 Insecure Design | MEDIUM | Domain-specific errors; no business logic in controllers |
| A05 Security Misconfiguration | MEDIUM | Env var validation at startup; `SKIP_SAAS_AUTH` only in Docker |
| A06 Vulnerable Components | LOW | `yarn audit` before release |
| A07 Auth Failures | HIGH | Bcrypt; verification tokens expire in 24h; session invalidation |
| A08 Data Integrity | LOW | Immutable domain entities; RETURNING on INSERT |
| A09 Logging Failures | MEDIUM | No sensitive data in logs; unexpected errors always logged |
| A10 SSRF | LOW | No user-controlled URLs used in server-side requests |
