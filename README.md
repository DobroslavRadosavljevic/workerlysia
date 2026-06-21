# ⚡ Workerlysia

A public reference project showing how far a small **Cloudflare Worker** can go with [Elysia](https://elysiajs.com/), **Effect**, **Effect Schema**, and **Cloudflare KV**.

The current real-world example is a type-safe **official Minecraft API proxy**. It wraps Mojang, Minecraft Services, Session Server, `textures.minecraft.net`, and Piston metadata without depending on third-party skin/avatar APIs.

[![Bun](https://img.shields.io/badge/Bun-1.3+-black?logo=bun)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-1.4+-blue)](https://elysiajs.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

- 🚀 **Elysia Framework** - Ergonomic, type-safe web framework with end-to-end type safety
- ☁️ **Cloudflare Workers** - Deploy to the edge with zero cold starts
- ⛏️ **Official Minecraft Proxy** - Wraps Mojang, Minecraft Services, Session Server, textures, and Piston metadata APIs
- 🧱 **KV-backed Caching** - Caches official JSON metadata through an internal Cloudflare KV service
- 🖼️ **Skin Texture CDN Route** - Serves official `textures.minecraft.net` PNGs through strict texture-hash routes
- 📖 **OpenAPI** - Auto-generated API documentation at `/docs`
- 🔒 **Type Safety** - Full TypeScript support with strict mode
- ✅ **Effect Schema Validation** - Request/response validation with Effect Schema through Elysia Standard Schema support
- 🧠 **Effect Runtime** - Route business logic and KV IO modeled with Effect v4 beta
- 🧪 **Vitest Tests** - Route tests use Eden Treaty for type-safe calls; Effect service tests use `@effect/vitest`
- 🛠️ **Ultracite** - Zero-config linting & formatting (Oxlint + Oxfmt)
- ✅ **Manual Quality Gate** - `bun run check` runs linting, `tsgo`, Vitest, and audit
- ⚡ **Bun Runtime** - Fast package manager and Cloudflare Worker runtime companion

## 🧪 What This Demonstrates

Workerlysia is intentionally not another static todo demo. The Minecraft module is a concrete example of patterns that are useful in real Cloudflare Worker APIs:

- 🧩 **Module-first architecture** with route, schema, service, error, utility, type, and constant ownership under `src/modules/<module>/`.
- 🧠 **Effect-first business logic** using services, tagged errors, Layers, a shared `ManagedRuntime`, Effect Clock/DateTime, and Effect's HTTP client.
- 📐 **Effect Schema everywhere** for request contracts, response contracts, cache decoding, upstream decoding, and OpenAPI generation through Elysia Standard Schema support.
- ☁️ **Cloudflare KV as infrastructure**, wrapped behind services instead of exposed as raw public routes.
- 🧱 **Cache-aware edge API design**, including positive cache hits/misses, best-effort cache writes, immutable texture proxy responses, and official upstream isolation.
- 🧪 **Type-safe testing** with Eden Treaty for route calls, Vitest for the runner, `@effect/vitest` for services/layers, and deterministic Cloudflare/upstream mocks.
- 🔐 **Install and supply-chain defaults** with Bun's release-age delay and Socket.dev scanner.

## 🧭 Current Setup

- 🧱 **Worker config**: `wrangler.jsonc` is the source of truth, with compatibility date `2026-06-21`.
- 🧬 **Worker types**: runtime types come from `@cloudflare/workers-types`; binding types are generated into `worker-configuration.d.ts` by `bun run cf-typegen`.
- ⚡ **Type checking**: `bun run typecheck` uses Microsoft's native TypeScript preview CLI, `tsgo`.
- 🧪 **Testing**: `bun run test` runs Vitest; Bun's test runner is not used.
- 🧠 **Effect**: `effect@4.0.0-beta.83` is the newest v4 beta accepted by Bun's three-day release-age policy.
- 🔐 **Install security**: `bunfig.toml` enforces a three-day `minimumReleaseAge` and Socket.dev scanning.
- 🧹 **Lint/format**: `oxlint.config.ts` and `oxfmt.config.ts` use Ultracite's current Oxlint/Oxfmt presets.
- 🤖 **Agent guidance**: `AGENTS.md` is the repo-local agent handbook. There is no `.claude` folder.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.3+)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works great)

### Setup

```bash
# Clone the repository
git clone https://github.com/DobroslavRadosavljevic/workerlysia.git
cd workerlysia

# Install dependencies
bun install

# Set up local Worker secrets/variables (optional)
cp .dev.vars.example .dev.vars

# Start development server
bun run dev
```

Open [http://localhost:8787/docs](http://localhost:8787/docs) to see the API docs - Scalar UI 🎉

Access the OpenAPI specification:

- **JSON**: [http://localhost:8787/docs/openapi.json](http://localhost:8787/docs/openapi.json)

### Deploy

```bash
# Login to Cloudflare (first time only)
bunx wrangler login

# Deploy to production
bun run deploy
```

## 📁 Project Structure

```
AGENTS.md                 # 🤖 Agent-facing project guide
bunfig.toml               # 🔐 Bun install security settings
TESTING.md                # 🧪 Testing guide and examples
wrangler.jsonc            # ☁️ Cloudflare Worker configuration
worker-configuration.d.ts # 🧬 Generated Worker binding types
vitest.config.ts          # 🧪 Vitest config and Cloudflare runtime alias
src/
├── index.ts              # 🏠 App entrypoint - registers module routes
├── effect/               # 🧠 Effect app layer and runtime helpers
└── modules/              # 🧩 Feature-style module tree
    ├── general/          # 👋 Welcome/root route
    ├── minecraft/        # ⛏️ Official Minecraft proxy routes, schemas, services, errors
    ├── shared/           # 🤝 Shared schemas and errors
    └── storage/          # ☁️ Internal Cloudflare KV service and tagged errors
tests/
├── mocks/                # 🧪 Test-only Cloudflare and official API shims
├── routes.test.ts        # 📍 Eden Treaty route tests
└── services.test.ts      # 🧠 Effect service tests with @effect/vitest
```

## 🗺️ API Surface

| Route                                      | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `GET /`                                    | 👋 Welcome response with docs link                        |
| `GET /docs`                                | 📖 Scalar OpenAPI UI                                      |
| `GET /docs/openapi.json`                   | 🧾 OpenAPI JSON specification                             |
| `GET /minecraft/players/:nameOrUuid`       | ⛏️ Resolve a Minecraft username or UUID to profile data   |
| `POST /minecraft/players/resolve`          | 👥 Resolve up to 10 Minecraft usernames in one request    |
| `GET /minecraft/profiles/:nameOrUuid`      | 🧍 Get a Mojang session profile and decoded texture links |
| `GET /minecraft/profiles/:nameOrUuid/skin` | 🖼️ Resolve and proxy a player's official skin PNG         |
| `GET /minecraft/textures/:textureId`       | 🧊 Proxy an immutable official Minecraft texture PNG      |
| `GET /minecraft/blocked-servers`           | 🚫 Return Mojang's official blocked server hash list      |
| `GET /minecraft/versions`                  | 📦 List official Minecraft versions from Piston metadata  |
| `GET /minecraft/versions/:versionId`       | 🔎 Get official Piston metadata for one Minecraft version |

The proxy intentionally does **not** call third-party skin/avatar services. Official upstream hosts are limited to Minecraft Services, Mojang Session Server, `textures.minecraft.net`, and Piston metadata.

## 📜 Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `bun run dev`        | 🔧 Start local development server    |
| `bun run deploy`     | 🚀 Deploy to Cloudflare Workers      |
| `bun run lint`       | 🔍 Check code for issues             |
| `bun run format`     | ✨ Auto-fix formatting & lint issues |
| `bun run typecheck`  | 📋 Run TypeScript checks with `tsgo` |
| `bun run test`       | 🧪 Run Vitest once                   |
| `bun run test:watch` | 👀 Run Vitest in watch mode          |
| `bun run check`      | ✅ Run lint, typecheck, tests, audit |
| `bun run cf-typegen` | 📝 Generate Cloudflare binding types |

## ✅ Quality Gate

This project does not use Git hooks. Run the checks manually before handing off changes:

```bash
bun run check
```

Route tests use Eden Treaty with the local Elysia instance for type-safe calls, so they do not need a local HTTP server. Raw `app.handle(new Request(...))` is reserved for intentionally invalid request-shape tests. Effect service tests use `@effect/vitest` layer helpers. See [TESTING.md](./TESTING.md) for route, validation, Cloudflare mock, and Effect service examples.

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add user authentication       # ✅ New feature
fix: resolve login bug              # ✅ Bug fix
docs: update API documentation      # ✅ Documentation
chore: update dependencies          # ✅ Maintenance
refactor: simplify route handler    # ✅ Code refactor
```

## 🏗️ Adding New Routes

1. **Create module schemas** under `src/modules/<module>/schema/api/`:

```typescript
// src/modules/users/schema/api/params.ts
import { Schema } from "effect";

export const UserParamsSchema = Schema.Struct({
  id: Schema.String,
});
```

```typescript
// src/modules/users/schema/api/response.ts
import { Schema } from "effect";

export const UserSchema = Schema.Struct({
  email: Schema.String.annotate({ format: "email" }),
  id: Schema.String,
  name: Schema.String.annotate({ examples: ["John Doe"] }),
});
```

2. **Create a route** in the module's `api/routes/` folder:

```typescript
// src/modules/users/api/routes/get-user.ts
import { Effect, Schema } from "effect";
import { Elysia } from "elysia";

import { RouteRuntime } from "../../../../effect/app";
import { UserParamsSchema } from "../../schema/api/params";
import { UserSchema } from "../../schema/api/response";

export const getUserRoute = new Elysia().get(
  "/users/:id",
  ({ params, status }) =>
    RouteRuntime.runPromise(
      Effect.succeed({
        email: "john@example.com",
        id: params.id,
        name: "John",
      }).pipe(Effect.map((result) => status(200, result)))
    ),
  {
    detail: {
      summary: "Get user by ID",
      tags: ["Users"],
    },
    params: Schema.toStandardSchemaV1(UserParamsSchema),
    response: { 200: Schema.toStandardSchemaV1(UserSchema) },
  }
);
```

3. **Register the route** in `src/index.ts`:

```typescript
import { getUserRoute } from "./modules/users/api/routes/get-user";

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    openapi({
      /* ... */
    })
  )
  .use(getUserRoute) // 👈 Add your route
  .compile();
```

## ☁️ Cloudflare Bindings

This project includes a pre-configured KV binding used by the internal Minecraft cache service.

> **Important:** The `wrangler.jsonc` file must point to a KV namespace in your Cloudflare account. Replace the example `id` with your own namespace ID before deploying.

To set up your own:

```bash
# Login to Cloudflare (first time only)
bunx wrangler login
```

### KV (Key-Value Storage)

```bash
bunx wrangler kv namespace create KV
```

Update `wrangler.jsonc` with the generated `id`:

```jsonc
{
  "kv_namespaces": [{ "binding": "KV", "id": "your-namespace-id" }],
}
```

**Usage inside a service:**

```typescript
import { Effect } from "effect";

import { CloudflareKvService } from "../../services/cloudflare-kv/service";

export const kvProgram = CloudflareKvService.use((kv) =>
  Effect.gen(function* kvExample() {
    yield* kv.put("key", "value");
    const value = yield* kv.get("key");

    return { value };
  })
);
```

`RouteRuntime` is the reusable `ManagedRuntime` exported from `src/effect/app.ts`, so route handlers do not rebuild or re-provide the app layer for every request.

Do not expose raw KV get/put/delete routes as product API. Storage access should stay behind module services such as `MinecraftCacheService`.

### Regenerate Types

Always run this after modifying bindings in `wrangler.jsonc`:

```bash
bun run cf-typegen
```

### Local Secrets

For local development, use `.dev.vars` and keep it out of git:

```bash
cp .dev.vars.example .dev.vars
```

Use `wrangler secret put <NAME>` for deployed secrets. Do not store sensitive values in `vars` inside `wrangler.jsonc`.

## 🔐 Install Security

Bun installs use a three-day `minimumReleaseAge` and the Socket security scanner configured in `bunfig.toml`. The scanner runs in free mode by default; set `SOCKET_API_KEY` to use your Socket.dev organization settings.

```toml
[install]
minimumReleaseAge = 259200

[install.security]
scanner = "@socketsecurity/bun-security-scanner"
```

## 📚 Resources

- 📖 [Elysia Documentation](https://elysiajs.com)
- 🧠 [Effect Documentation](https://effect.website)
- ☁️ [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- 🔧 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- 📐 [Effect Schema](https://effect.website/docs/schema/introduction/)
- ⛏️ [Minecraft Services API](https://api.minecraftservices.com)
- 📦 [Piston Version Manifest](https://piston-meta.mojang.com/mc/game/version_manifest_v2.json)

## 🔎 Public Source

This repository is public for source visibility and reuse under the MIT license. It is maintained as an example/reference codebase, not as a community contribution project. External issues, feature requests, pull requests, and contribution workflows are not accepted.

## 📄 License

MIT License.

---

<p align="center">
  Built with 💜 using <a href="https://elysiajs.com/">Elysia</a>, <a href="https://effect.website/">Effect</a>, and <a href="https://workers.cloudflare.com/">Cloudflare Workers</a>
</p>
