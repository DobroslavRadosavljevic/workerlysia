import { Context, Effect, Layer, Schema } from "effect";

import { parseJson, recoverEffect, stringifyJson } from "../effect/runtime";
import { CloudflareKv } from "./cloudflare-kv";

const CachedEntrySchema = Schema.Struct({
  body: Schema.String,
  contentType: Schema.String,
});

export type CacheLookup =
  | {
      readonly _tag: "Hit";
      readonly contentType: string;
      readonly value: unknown;
    }
  | {
      readonly _tag: "Miss";
    };

const cacheMiss: CacheLookup = { _tag: "Miss" };

export class CacheService extends Context.Service<
  CacheService,
  {
    readonly get: (cacheKey: string) => Effect.Effect<CacheLookup>;
    readonly set: (
      cacheKey: string,
      responseValue: unknown,
      contentType: string,
      expirationTtl: number
    ) => Effect.Effect<void>;
  }
>()("CacheService") {}

export const CacheServiceLive = Layer.effect(
  CacheService,
  Effect.gen(function* makeCacheService() {
    const kv = yield* CloudflareKv;

    return CacheService.of({
      get: (cacheKey) =>
        Effect.gen(function* getCachedValue() {
          const cached = yield* kv.get(cacheKey);

          if (cached === null) {
            return cacheMiss;
          }

          const parsedEntry = yield* parseJson(cached);
          const entry =
            yield* Schema.decodeUnknownEffect(CachedEntrySchema)(parsedEntry);
          const value = yield* parseJson(entry.body);

          return {
            _tag: "Hit",
            contentType: entry.contentType,
            value,
          } as const;
        }).pipe(recoverEffect(() => Effect.succeed(cacheMiss))),
      set: (cacheKey, responseValue, contentType, expirationTtl) =>
        Effect.gen(function* setCachedValue() {
          const body = yield* stringifyJson(responseValue);
          const payload = yield* stringifyJson({ body, contentType });

          yield* kv.put(cacheKey, payload, { expirationTtl });
        }).pipe(recoverEffect(() => Effect.void)),
    });
  })
);
