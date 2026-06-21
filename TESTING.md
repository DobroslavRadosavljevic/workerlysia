# 🧪 Testing Guide

Workerlysia uses **Vitest** for tests. Do not use Bun's test runner for this project.

The test suite is part of the public reference value of this repo: it shows how to test an Elysia Cloudflare Worker without a network server, how to exercise Effect services and Layers, and how to keep KV plus official upstream API behavior deterministic.

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
│   ├── cloudflare-workers.ts # Test-only cloudflare:workers shim
│   └── minecraft-fetch.ts    # Official Minecraft/Mojang/Piston fetch fixtures
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
await api.minecraft.players({ nameOrUuid: "Notch" }).get(); // GET /minecraft/players/:nameOrUuid
await api.minecraft.players.resolve.post({
  usernames: ["Notch", "jeb_"],
}); // POST /minecraft/players/resolve
await api.minecraft.profiles({ nameOrUuid: "Notch" }).get({
  query: { signed: "true" },
}); // GET /minecraft/profiles/:nameOrUuid?signed=true
await api.minecraft.versions.get(); // GET /minecraft/versions
await api.minecraft.versions({ versionId: "1.21.6" }).get(); // GET /minecraft/versions/:versionId
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

it("rejects an invalid Minecraft player identifier", async () => {
  const response = await rawRequest("/minecraft/players/no");
  const body = await response.json();

  expect(response.status).toBe(422);
  expect(body).toMatchObject({
    on: "params",
    property: "nameOrUuid",
    type: "validation",
  });
});
```

Use full URLs when constructing `Request` objects through helpers. Elysia expects a valid absolute URL, not a path-only string.

Prefer assertions on stable fields like `status`, `type`, `on`, `property`, and your own response body shape. Avoid snapshotting full Elysia validation payloads unless the exact diagnostic text is intentionally part of the contract.

## ☁️ Cloudflare Runtime Mocks

Vitest runs in Node, but the app imports `cloudflare:workers` for the Worker `env`. `vitest.config.ts` aliases that module to `tests/mocks/cloudflare-workers.ts`.

The current mock provides an in-memory `env.KV` implementation for cache-backed services. The app does not expose raw public KV routes.

Use `resetTestKv()` in `beforeEach` when a test touches KV-backed behavior:

```typescript
import { beforeEach } from "vitest";

import { resetTestKv } from "./mocks/cloudflare-workers";

beforeEach(() => {
  resetTestKv();
});
```

When adding a new Cloudflare binding, extend the test shim with the smallest compatible surface needed by tests. Keep the mock deterministic and in memory.

## ⛏️ Official Upstream Mocks

Minecraft proxy tests should use `tests/mocks/minecraft-fetch.ts` and `vi.stubGlobal("fetch", createMinecraftFetchMock())`.

Production code uses Effect's `HttpClient` from `effect/unstable/http`, with `FetchHttpClient.layer` providing the fetch-backed implementation. Service tests for HTTP-backed services should provide that layer and then stub `globalThis.fetch` through Vitest.

The mock fixture only handles official hosts:

- `api.minecraftservices.com`
- `sessionserver.mojang.com`
- `textures.minecraft.net`
- `piston-meta.mojang.com`

Do not add fixtures for third-party Minecraft skin/avatar services. If production code starts calling Crafatar, MCHeads, Minotar, Mineatar, MineSkin, or a similar service, tests should fail.

## 🧠 Effect Tests

Use `@effect/vitest` for Effect service, layer, and program tests. This keeps assertions inside the Effect runtime and supports layer provisioning.

```typescript
import { expect, layer } from "@effect/vitest";
import { Effect } from "effect";

import { MojangApiLive } from "../src/modules/minecraft/services/mojang-api/live";
import { MojangApiService } from "../src/modules/minecraft/services/mojang-api/service";

layer(MojangApiLive)("MojangApiService", (it) => {
  it.effect("decodes official profile responses", () =>
    Effect.gen(function* decodeOfficialProfileResponses() {
      const api = yield* MojangApiService;
      const profile = yield* api.resolveUsername("Notch");

      expect(profile.name).toBe("Notch");
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
