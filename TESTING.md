# 🧪 Testing Guide

Workerlysia uses **Vitest** for tests. Do not use Bun's test runner for this project.

The test setup has two main layers:

- **Route tests** use Eden Treaty for type-safe route calls, with raw `app.handle(new Request(...))` only when intentionally sending invalid requests.
- **Effect tests** use `@effect/vitest` for services, layers, and Effect programs.

## 🚀 Commands

```bash
bun run test       # Run Vitest once
bun run test:watch # Run Vitest in watch mode
bun run check      # Run lint, typecheck, tests, and audit
```

`bun` is only the package/script runner here. The test runner is Vitest.

## 📁 Test Layout

```text
tests/
├── mocks/
│   └── cloudflare-workers.ts # Test-only cloudflare:workers shim
├── routes.test.ts            # Eden Treaty + Elysia route tests
└── services.test.ts          # Effect service/layer tests
```

Keep test-only runtime shims under `tests/mocks/`. Do not import mocks from `src/`, and do not add test-only branches to production code.

## 📍 Type-Safe Route Tests With Eden Treaty

Successful route tests should import the compiled Elysia app and pass it directly to Eden Treaty. This follows Elysia's unit-test guidance: `treaty(app)` calls the Elysia instance directly without a network request and gives the test type-safe request bodies, query objects, path params, and responses.

```typescript
import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "vitest";

import app from "../src/index";

const api = treaty(app);

describe("GET /", () => {
  it("returns the welcome payload", async () => {
    const response = await api.get();

    expect(response.error).toBeNull();
    if (response.error) {
      throw response.error;
    }

    expect(response.data).toEqual({
      docs: "/docs",
      message: "Welcome to Workerlysia API",
      version: "1.0.0",
    });
  });
});
```

Treaty maps routes to a tree-like API:

```typescript
await api.get(); // GET /
await api.tasks.get({ query: { isCompleted: "true", page: 1 } }); // GET /tasks
await api.tasks.post({
  completed: false,
  due_date: "2026-06-21",
  name: "Task",
  slug: "task",
}); // POST /tasks
await api.tasks({ taskSlug: "example-task" }).get(); // GET /tasks/:taskSlug
await api.kv({ key: "test-key" }).put({ value: "hello" }); // PUT /kv/:key
```

If a Treaty call does not compile, treat that as useful feedback. Either the route contract changed or the test is trying to send an invalid request.

## 📐 Validation Tests

When adding or changing route schemas, add at least one validation-failure test for the relevant boundary. Use raw `app.handle(...)` for these tests because the type-safe Treaty client should prevent invalid requests from compiling.

- `query`
- `params`
- `body`
- `headers`
- `response` when practical through normal route behavior

Example:

```typescript
import app from "../src/index";

const rawRequest = (path: string, init?: RequestInit): Promise<Response> =>
  app.handle(new Request(`http://localhost${path}`, init));

it("rejects an invalid task filter", async () => {
  const response = await rawRequest("/tasks?isCompleted=maybe");
  const body = await response.json();

  expect(response.status).toBe(422);
  expect(body).toMatchObject({
    on: "query",
    property: "isCompleted",
    type: "validation",
  });
});
```

Use full URLs when constructing `Request` objects through helpers. Elysia expects a valid absolute URL, not a path-only string.

Prefer assertions on stable fields like `status`, `type`, `on`, `property`, and your own response body shape. Avoid snapshotting full Elysia validation payloads unless the exact diagnostic text is intentionally part of the contract.

## ☁️ Cloudflare Runtime Mocks

Vitest runs in Node, but the app imports `cloudflare:workers` for the Worker `env`. `vitest.config.ts` aliases that module to `tests/mocks/cloudflare-workers.ts`.

The current mock provides an in-memory `env.KV` implementation for the app's KV routes.

Use `resetTestKv()` in `beforeEach` when a test touches KV-backed behavior:

```typescript
import { beforeEach } from "vitest";

import { resetTestKv } from "./mocks/cloudflare-workers";

beforeEach(() => {
  resetTestKv();
});
```

When adding a new Cloudflare binding, extend the test shim with the smallest compatible surface needed by tests. Keep the mock deterministic and in memory.

## 🧠 Effect Tests

Use `@effect/vitest` for Effect service, layer, and program tests. This keeps assertions inside the Effect runtime and supports layer provisioning.

```typescript
import { expect, layer } from "@effect/vitest";
import { Effect } from "effect";

import { TaskService, TaskServiceLive } from "../src/services/tasks";

layer(TaskServiceLive)("TaskService", (it) => {
  it.effect("filters completed tasks", () =>
    Effect.gen(function* filterCompletedTasks() {
      const tasks = yield* TaskService;
      const completed = yield* tasks.list("true");

      expect(completed).toHaveLength(1);
      expect(completed[0]?.completed).toBe(true);
    })
  );
});
```

Use `layer(...)` when the unit under test requires services. Use plain Vitest when the test is only checking HTTP behavior through Elysia.

## ✅ What To Cover

For every new route, cover:

- Expected success status and body shape.
- At least one relevant schema failure.
- Important headers when the route owns them.
- Error status/body for recoverable tagged errors.
- KV side effects when the route reads or writes storage.

For every new service, cover:

- Main successful behavior.
- Tagged error behavior when the service can fail.
- Layer wiring when the service depends on another service.
- Runtime decoding/parsing behavior when reading external data.

## 🧹 Style Rules

- Import test APIs explicitly; Vitest globals are disabled.
- Keep test suites shallow and readable.
- Put assertions inside `it(...)`, `test(...)`, or `it.effect(...)`.
- Use async/await; do not use callback-style `done`.
- Prefer small helpers inside the test file over broad shared test utilities.
- Do not assert on random timestamps or random numbers exactly; assert shape/type unless the value is controlled.
- Keep fixtures close to the test unless they are reused enough to justify a helper.

## 🧭 Before Handoff

Run:

```bash
bun run format
bun run check
```

`bun run check` includes Vitest, typechecking with `tsgo`, Ultracite, and `bun audit`.
