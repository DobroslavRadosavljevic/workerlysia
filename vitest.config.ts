import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "cloudflare:workers": new URL(
        "tests/mocks/cloudflare-workers.ts",
        import.meta.url
      ).pathname,
    },
  },
  test: {
    clearMocks: true,
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    testTimeout: 5000,
  },
});
