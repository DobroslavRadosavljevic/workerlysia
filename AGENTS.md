# ⚡ Workerlysia

A **Cloudflare Worker** API built with **Elysia** framework and **Bun** runtime.

## 🧱 Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: [Elysia](https://elysiajs.com/) with CloudflareAdapter
- **Package Manager**: Bun 1.3 via `packageManager`
- **Language**: TypeScript (strict mode), checked with `tsgo`
- **Effect**: Effect v4 beta for route business logic, recoverable errors, schema validation, and KV IO wrappers
- **Testing**: Vitest for tests, with `@effect/vitest` for Effect service/layer tests
- **API Documentation**: OpenAPI via `@elysiajs/openapi` (available at `/docs`)
- **Linting/Formatting**: Ultracite (Oxlint + Oxfmt)
- **Install Security**: Bun `minimumReleaseAge` plus Socket.dev scanner in `bunfig.toml`
- **Quality Gate**: Manual `bun run check`; no Git hooks

## 🧰 Commands

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `bun run dev`        | Start local development server      |
| `bun run deploy`     | Deploy to Cloudflare Workers        |
| `bun run lint`       | Check code for issues               |
| `bun run format`     | Auto-fix formatting and lint issues |
| `bun run typecheck`  | Run TypeScript checks with `tsgo`   |
| `bun run test`       | Run Vitest once                     |
| `bun run test:watch` | Run Vitest in watch mode            |
| `bun run check`      | Run lint, typecheck, tests, audit   |
| `bun run cf-typegen` | Generate Cloudflare Worker types    |

## 📁 Project Structure

```
src/
├── index.ts           # App entrypoint - registers routes and plugins
├── effect/            # Effect app layer, runtime helpers, and tagged errors
├── services/          # Context.Service definitions plus Live layers
├── plugins/           # Reusable Elysia plugins (macros)
│   ├── cache.ts       # Response caching with KV
│   └── rate-limit.ts  # Rate limiting with KV
├── routes/            # API route handlers (one file per endpoint)
│   ├── demo/          # Demo routes for testing plugins
│   ├── storage/       # KV example routes
│   └── tasks/         # Task CRUD routes
└── schemas/           # Effect Schema models for validation/OpenAPI
    ├── common.ts
    ├── kv.ts
    └── task.ts
tests/
├── mocks/             # Vitest-only runtime shims
├── routes.test.ts     # Elysia route tests through app.handle(Request)
└── services.test.ts   # Effect service tests with @effect/vitest
```

## 🧭 Current App Surface

- `/` returns the API welcome payload and links to `/docs`.
- `/docs` serves Scalar/OpenAPI UI, and `/docs/openapi.json` serves the OpenAPI spec.
- `/tasks` and `/tasks/:taskSlug` are demo CRUD-style routes backed by static/example data.
- `/kv/:key` reads, writes, and deletes values through the Cloudflare `KV` binding.
- `/demo/cached*` demonstrates the cache macro.
- `/demo/rate-limited*` demonstrates the rate-limit macro.

## ✅ Conventions

### 📍 Route Files

- Each route is a separate Elysia instance exported from its own file
- Routes are composed in `src/index.ts` using `.use()`
- Always include `detail` with `summary` and `tags` for OpenAPI documentation

```typescript
import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "./effect/app";

export const myRoute = new Elysia().get(
  "/path",
  ({ query }) => RouteRuntime.runPromise(Effect.succeed({ query })),
  {
    detail: {
      summary: "Description for OpenAPI",
      tags: ["TagName"],
    },
    query: Schema.toStandardSchemaV1(MyQuerySchema),
    response: {
      200: Schema.toStandardSchemaV1(ResponseSchema),
    },
  }
);
```

### 📐 Schemas

- Define schemas in `src/schemas/` using Effect Schema
- Pass schemas to Elysia inline with `Schema.toStandardSchemaV1(...)`; do not add a local wrapper for route schemas
- Keep `mapJsonSchema.effect` in `src/index.ts` as an inline `(schema: Schema.Top) => Schema.toJsonSchemaDocument(schema).schema` callback so OpenAPI can render Effect schemas
- Use descriptive examples and format hints for OpenAPI documentation

```typescript
import { Schema } from "effect";

export const MySchema = Schema.Struct({
  date: Schema.String.annotate({ format: "date" }),
  name: Schema.String.annotate({ examples: ["example"] }),
  optional: Schema.optionalKey(Schema.String),
});
```

### 🧠 Effect Boundaries

- Keep Elysia as the HTTP boundary and run Effect programs with `RouteRuntime.runPromise(...)`.
- `RouteRuntime` is the reusable `ManagedRuntime` from `src/effect/app.ts`; do not provide the full app layer per request.
- Define dependencies as `Context.Service` classes under `src/services/`.
- Provide implementations as `*Live` layers and compose them in `src/effect/app.ts`.
- Use `Schema.TaggedErrorClass` classes under `src/effect/errors/` for recoverable domain/IO failures so constructor payload properties are Effect Schema-backed.
- Give distinct failing operations distinct tagged error classes, such as `GetKvError`, `PutKvError`, and `DeleteKvError`; do not use a generic error with an `operation` field.
- Construct operation-specific tagged errors inline at the failing boundary; do not add local error-constructor wrappers like `kvError(...)`.
- Use `Effect.gen`, `Effect.succeed`, `Effect.try`, `Effect.tryPromise`, `Effect.result`, and `recoverTagged(...)` for business logic, parsing, async IO, and recoverable errors.
- Use Effect's clock-backed APIs for current time inside Effect code: `Clock.currentTimeMillis` for numeric time and `DateTime.now` plus `DateTime.formatIso*` for formatted dates. Do not call `Date.now()` or `new Date()` as the time source in services, routes, or plugins.
- Use `CloudflareKv` from `src/services/cloudflare-kv.ts` for KV operations instead of calling `env.KV` directly in routes/plugins.
- Use `Schema.decodeUnknownEffect(...)` when data comes from storage or JSON parsing and needs runtime validation.

### 🧪 Testing

- Use Vitest, not Bun's test runner.
- Read `TESTING.md` before adding or changing tests.
- Test successful Elysia route flows with Eden Treaty via `treaty(app)` for end-to-end type-safe request/response checks.
- Use `app.handle(new Request("http://localhost/..."))` for intentionally invalid request-shape tests that a typed Treaty client should reject at compile time.
- Import `describe`, `it`, `expect`, and lifecycle helpers explicitly from `vitest`; Vitest globals are disabled.
- Use `@effect/vitest` for Effect-heavy tests, especially `layer(...)(...)` and `it.effect(...)` when testing services and layers.
- Keep Cloudflare runtime shims under `tests/mocks/`; do not leak test-only mocks into `src/`.
- Add tests for schema validation failures when adding request schemas.
- Cover success behavior, validation failures, recoverable tagged errors, plugin-owned headers, and KV side effects when the route owns them.
- Keep stateful cache/rate-limit route tests sequential and reset test KV state between tests.

### ☁️ Cloudflare Bindings

- Worker bindings are configured in `wrangler.jsonc`
- Types are generated with `bun run cf-typegen` into `worker-configuration.d.ts`
- KV access is wrapped by `CloudflareKvLive` in `src/services/cloudflare-kv.ts`, which imports Cloudflare's Worker `env`
- Use `.dev.vars` for local Worker secrets and variables. Keep `.dev.vars` out of git and use `.dev.vars.example` as the committed template.
- Use `wrangler secret put <NAME>` for deployed secrets. Do not store sensitive values in `vars` inside `wrangler.jsonc`.
- `compatibility_date` is intentionally current and should be followed by `bun run cf-typegen` after changes.

**Available binding exposed through services:**

- `env.KV` - KVNamespace for key-value storage

### 🔌 Plugins

KV-powered plugins using Elysia macros. Enable per-route by adding the macro option:

**Cache Plugin** (`src/plugins/cache.ts`):

```typescript
import { cachePlugin } from "./plugins/cache";

new Elysia()
  .use(cachePlugin())
  .get("/data", () => getData(), { cache: 300 }) // Cache 300s
  .get("/fresh", () => getData()); // No cache (macro not defined)
```

**Rate Limit Plugin** (`src/plugins/rate-limit.ts`):

```typescript
import { rateLimitPlugin } from "./plugins/rate-limit";

new Elysia()
  .use(rateLimitPlugin())
  .get("/api", () => getData(), { rateLimit: { max: 100, window: 60 } })
  .get("/public", () => getData()); // No limit (macro not defined)
```

**Note:** KV minimum TTL is 60 seconds.

### 🔐 Install Security

- `bunfig.toml` sets `minimumReleaseAge = 259200` to avoid very new npm releases during normal installs.
- `bunfig.toml` configures `@socketsecurity/bun-security-scanner` as Bun's install security scanner.
- The Socket scanner works in free mode by default. Set `SOCKET_API_KEY` to use Socket.dev organization settings.
- Before adding any new dependency, check package reputation and install-script risk. Do not add suspicious packages just because they are convenient.

### 🧹 Tooling Config

- Oxlint config lives in `oxlint.config.ts` and extends `ultracite/oxlint/core`.
- Oxfmt config lives in `oxfmt.config.ts` and extends `ultracite/oxfmt`.
- The generated `worker-configuration.d.ts` file is ignored by Oxlint/Oxfmt and should only be changed through `bun run cf-typegen`.
- There is no `.claude` project config; use this `AGENTS.md` file as the agent-facing source of truth.

## ✅ Quality Gate

This project intentionally does not use Git hooks. Run checks manually before handing off changes:

```bash
bun run check
```

### 📝 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
chore: maintenance tasks
refactor: code refactoring
```

## 🚀 Development Workflow

1. Start dev server: `bun run dev`
2. View API docs: `http://localhost:8787/docs`
3. Make changes (hot reload enabled)
4. Run `bun run check`
5. Regenerate Worker types with `bun run cf-typegen` after binding or compatibility changes
6. Commit only after user approval if you are an agent
7. Deploy: `bun run deploy`

---

# 🛠️ Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## ⚡ Quick Reference

- **Format code**: `bun run format` (or `bun x ultracite fix`)
- **Check for issues**: `bun run lint` (or `bun x ultracite check`)
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## 🧠 Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### 🔒 Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### ✨ Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### ⏳ Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### 🚨 Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### 🗂️ Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### 🛡️ Security

- Validate and sanitize user input
- Use Elysia's schema validation for all request bodies and query parameters
- Never expose sensitive data in error responses

### ⚡ Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)

---

## 🧪 Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## 🧩 When Oxlint + Oxfmt Can't Help

Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Route structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun run format` before committing to ensure compliance.
