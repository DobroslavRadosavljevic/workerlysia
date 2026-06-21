import { Elysia } from "elysia";

import { RouteRuntime } from "../effect/app";
import { CacheService } from "../services/cache";

export interface CacheOptions {
  /**
   * Time to live in seconds (minimum 60)
   * @default 60
   */
  ttl?: number;
  /**
   * Key prefix for cache entries
   * @default "cache"
   */
  prefix?: string;
}

const MIN_TTL = 60;
const DEFAULT_TTL = 60;
const DEFAULT_PREFIX = "cache";

const getCacheKey = (
  prefix: string,
  path: string,
  searchParams: URLSearchParams
): string => {
  const sortedParams = new URLSearchParams(
    [...searchParams.entries()].toSorted((a, b) => a[0].localeCompare(b[0]))
  );
  const queryPart = sortedParams.toString()
    ? `?${sortedParams.toString()}`
    : "";
  return `${prefix}:${path}${queryPart}`;
};

/**
 * Cache plugin for Elysia using Cloudflare KV
 *
 * @example
 * ```ts
 * app
 *   .use(cachePlugin())
 *   .get('/data', () => fetchExpensiveData(), { cache: 300 })
 * ```
 */
export const cachePlugin = (options: CacheOptions = {}) => {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const defaultTtl = options.ttl ?? DEFAULT_TTL;

  return new Elysia({ name: "cache" })
    .derive({ as: "global" }, ({ request }) => {
      const url = new URL(request.url);
      return {
        cacheKey: getCacheKey(prefix, url.pathname, url.searchParams),
      };
    })
    .macro({
      cache: (ttl?: number | boolean) => ({
        async afterHandle({ cacheKey, set, responseValue }) {
          if (!ttl) {
            return;
          }

          const requestedTtl = typeof ttl === "number" ? ttl : defaultTtl;
          const actualTtl = Math.max(MIN_TTL, requestedTtl);
          const contentType = set.headers["content-type"] ?? "application/json";

          await RouteRuntime.runPromise(
            CacheService.use((cache) =>
              cache.set(cacheKey, responseValue, String(contentType), actualTtl)
            )
          );
        },
        async beforeHandle({ cacheKey, set }) {
          if (!ttl) {
            return;
          }

          const cached = await RouteRuntime.runPromise(
            CacheService.use((cache) => cache.get(cacheKey))
          );

          if (cached._tag === "Hit") {
            set.headers["x-cache"] = "HIT";
            set.headers["content-type"] = cached.contentType;
            return cached.value;
          }

          set.headers["x-cache"] = "MISS";
        },
      }),
    });
};
