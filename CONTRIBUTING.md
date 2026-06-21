# 🤝 Contributing to Workerlysia

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📖 Improve documentation
- 🔧 Submit pull requests

## 🚀 Getting Started

1. **Fork the repository**

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/workerlysia.git
   cd workerlysia
   ```

3. **Install dependencies**

   ```bash
   bun install
   ```

   Bun will apply the repo's `bunfig.toml` install policy:

   - 🔐 Three-day `minimumReleaseAge`
   - 🧪 Socket.dev package scanning through `@socketsecurity/bun-security-scanner`
   - 🗝️ Optional `SOCKET_API_KEY` support for Socket.dev organization settings

4. **Set up local Worker variables if needed**

   ```bash
   cp .dev.vars.example .dev.vars
   ```

   Do not commit `.dev.vars`. Use Cloudflare secrets for deployed sensitive values.

5. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Make your changes**

7. **Run checks**

   ```bash
   bun run format
   bun run test
   bun run check
   ```

   If you changed `wrangler.jsonc` bindings or the compatibility date, regenerate Worker types:

   ```bash
   bun run cf-typegen
   ```

8. **Commit your changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

9. **Push and create a PR**

   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🔍 Code Style

This project uses [Ultracite](https://github.com/haydenbleasel/ultracite) with Oxlint and Oxfmt:

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run format
```

Please ensure your code passes all checks before submitting a PR.

Type checking runs through Microsoft's native TypeScript preview CLI:

```bash
bun run typecheck # tsgo --noEmit
```

Tests run with Vitest, not Bun's test runner:

```bash
bun run test # vitest run
```

Use Eden Treaty with the local Elysia app for type-safe route tests, raw `app.handle(new Request(...))` for intentionally invalid request-shape tests, and `@effect/vitest` for Effect service or layer tests. Read [TESTING.md](./TESTING.md) before adding tests; it covers route helpers, validation failures, Cloudflare runtime mocks, and Effect layer tests.

## ☁️ Cloudflare Worker Notes

- `wrangler.jsonc` is the source of truth for Worker bindings and compatibility settings.
- `worker-configuration.d.ts` is generated. Update it with `bun run cf-typegen`; do not edit it by hand.
- The configured `KV` binding powers the KV examples.
- Route files should stay small Elysia instances registered from `src/index.ts`.
- Use Effect Schema in `src/schemas/` and pass schemas to Elysia inline with `Schema.toStandardSchemaV1(...)`.
- Keep route business logic and Cloudflare KV IO in `Context.Service` modules under `src/services/`.
- Provide service implementations with `*Live` layers and compose them in `src/effect/app.ts`.
- Use tagged errors from `src/effect/errors/` for recoverable failures.
- Run service-backed Effect programs at the Elysia boundary with `RouteRuntime.runPromise(...)`, using the reusable app `ManagedRuntime`.
- Use `CloudflareKv` / `CloudflareKvLive` instead of calling `env.KV` directly from routes.

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. A clear description of the issue
2. Steps to reproduce
3. Expected vs actual behavior
4. Your environment (OS, Bun version, etc.)

## 💡 Suggesting Features

Feature requests are welcome! Please:

1. Check existing issues first
2. Describe the use case
3. Explain why this would be useful

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 💜
